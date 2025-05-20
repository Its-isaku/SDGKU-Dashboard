<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../models/responseHelper.php';

class SurveyController
{
    private $db;

    public function __construct($pdo)
    {
        $this->db = $pdo;
    }

    // Retorna los datos del cuestionario por token (metadatos y preguntas)
    public function getSurvey($token)
    {
        if (!$token) jsonError('Token not provided');

        $sql = "SELECT s.*, pt.program_name AS program_type, p.name AS program_name, st.type_name AS survey_type
                FROM surveys s
                JOIN program_types pt ON s.program_type_id = pt.program_type_id
                JOIN programs p ON s.program_id = p.prog_id
                JOIN survey_types st ON s.survey_type_id = st.survey_type_id
                WHERE s.token = ? AND s.status = 'active' LIMIT 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$token]);
        $survey = $stmt->fetch();

        if (!$survey) jsonError('Invalid or unknown token', 404);

        // Verifica si la encuesta ha expirado
        if (new DateTime() > new DateTime($survey['expires_at'])) {
            jsonError('This survey has expired.', 403);
        }

        // Obtiene las preguntas de la encuesta
        $sqlQ = "SELECT questions_id, question_text, question_type_id, display_order
                 FROM questions WHERE survey_id = ? ORDER BY display_order";
        $stmtQ = $this->db->prepare($sqlQ);
        $stmtQ->execute([$survey['survey_id']]);
        $questions = $stmtQ->fetchAll();

        // Respuesta final con la estructura del cuestionario
        jsonSuccess([
            'survey_id'     => $survey['survey_id'],
            'title'         => $survey['title'],
            'description'   => $survey['description'],
            'program_type'  => $survey['program_type'],
            'program_id'    => $survey['program_id'],
            'program_name'  => $survey['program_name'],
            'survey_type'   => $survey['survey_type'],
            'expires_at'    => $survey['expires_at'],
            'questions'     => $questions
        ]);
    }

    // Devuelve los cohorts activos de un programa específico
    public function getCohorts($programId)
    {
        if (!$programId) jsonError('Program ID not provided');

        $sql = "SELECT cohort_id, cohort FROM cohort WHERE program_id = ? AND status = 'active'";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$programId]);
        $cohorts = $stmt->fetchAll();

        jsonSuccess(['cohorts' => $cohorts]);
    }

    // Devuelve las opciones disponibles para una pregunta
    public function getQuestionOptions($questionId, $type)
    {
        if (!$type) jsonError('Missing question type');

        // Diferentes tablas según el tipo de pregunta
        switch ($type) {
            case 'multiple':
                $sql = "SELECT question_opt_id, option_text, display_order 
                        FROM multiple_options 
                        WHERE id_question = ? 
                        ORDER BY display_order";
                $params = [$questionId];
                break;
            case 'Linkert_1_5':
                if (!$questionId) jsonError('Missing questionId');
                $sql = "SELECT scale_num, scale_option_text 
                        FROM Linkert_1_5 
                        WHERE question_id = ? 
                        ORDER BY scale_id";
                $params = [$questionId];
                break;
            case 'Linkert_1_3':
                if (!$questionId) jsonError('Missing questionId');
                $sql = "SELECT scale_num, scale_option_text 
                        FROM Linkert_1_3 
                        WHERE question_id = ? 
                        ORDER BY scale_id";
                $params = [$questionId];
                break;
            default:
                jsonError('Invalid question type');
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $options = $stmt->fetchAll();

        jsonSuccess(['options' => $options]);
    }

    // Procesa la respuesta de un usuario y guarda todo en la base de datos
    public function submitResponse($data)
    {
        // Validación de campos requeridos
        foreach (['surveyId', 'token', 'email', 'responses', 'completionTime'] as $field) {
            if (!isset($data[$field])) jsonError("Missing parameter: $field");
        }

        $this->db->beginTransaction();

        try {
            // Verifica que la encuesta exista, esté activa y no haya expirado
            $sqlSurvey = "SELECT survey_id, expires_at, status 
                          FROM surveys 
                          WHERE survey_id = ? AND token = ?";
            $stmtSurvey = $this->db->prepare($sqlSurvey);
            $stmtSurvey->execute([$data['surveyId'], $data['token']]);
            $survey = $stmtSurvey->fetch();

            if (!$survey) jsonError('Invalid survey ID or token');
            if ($survey['status'] !== 'active') jsonError('Survey is not active');
            if (new DateTime() > new DateTime($survey['expires_at'])) {
                jsonError('This survey has expired.', 403);
            }

            // Verifica si el usuario ya respondió esta encuesta
            $checkSql = "SELECT responses_id 
                         FROM responses 
                         WHERE survey_id = ? AND respondent_email = ?";
            $stmtCheck = $this->db->prepare($checkSql);
            $stmtCheck->execute([$data['surveyId'], $data['email']]);
            if ($stmtCheck->fetch()) jsonError('You have already submitted this survey.');

            // Usa el primer questionId solo como referencia para la tabla `responses`
            $firstQuestionId = $data['responses'][0]['questionId'];

            // Inserta entrada principal en `responses`
            $stmtResp = $this->db->prepare("
                INSERT INTO responses (survey_id, questions_id, respondent_email, submitted_at, completion_time)
                VALUES (?, ?, ?, NOW(), ?)
            ");
            $stmtResp->execute([
                $data['surveyId'],
                $firstQuestionId,
                $data['email'],
                $data['completionTime']
            ]);

            $responseId = $this->db->lastInsertId();

            // Inserta cada respuesta individual
            $stmtAns = $this->db->prepare("
                INSERT INTO answers (response_id, question_id, answer_text, question_type_id)
                VALUES (?, ?, ?, ?)
            ");

            foreach ($data['responses'] as $r) {
                $stmtAns->execute([
                    $responseId,
                    $r['questionId'],
                    $r['answer'],
                    $r['questionType']
                ]);
            }

            $this->db->commit();

            jsonSuccess([
                'message' => 'Response submitted successfully',
                'responseId' => $responseId
            ]);
        } catch (Exception $e) {
            $this->db->rollBack();
            jsonError('Database error: ' . $e->getMessage(), 500);
        }
    }
}

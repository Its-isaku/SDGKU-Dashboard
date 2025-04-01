# SDGKU Survey Platform

## Estructura de Trabajo

### Backend (BE)
- Se manejará la estructura del backend utilizando JavaScript/php
- Organización de archivos y carpetas para una arquitectura limpia y mantenible

### Frontend (FE)
- Estructura organizada para una mejor mantenibilidad:
  - `index.html`: Página principal
  - `login.html`: Página de inicio de sesión
  - `dashboard-main.html`: Panel principal del dashboard
  - `styles/`: Directorio de estilos CSS
  - `images/`: Directorio de recursos gráficos

## Normalización y Estándares de Programación

### Convenciones de Nombrado
- **CamelCase**: Estándar para nombrar variables, funciones y métodos
  - Ejemplo: `getUserData()`, `firstName`, `lastName`

### Estilos CSS
- **mainStyle.css**: Archivo principal de estilos que contiene:
  - Variables CSS (root) para colores, fuentes y espaciados
  - Estilos base y reset
  - Clases utilitarias comunes
  - Componentes base reutilizables
  - Sistema de grid y layout básico
  - Estilos responsivos base
  - Nota: Este archivo se irá expandiendo según las necesidades del proyecto

### Estructura HTML
- **Navbar**: Componente predefinido para mantener consistencia en la navegación
- **Sidebar**: (En desarrollo) Se predefinirá para mantener la consistencia en la navegación lateral
- **Área de Trabajo**: (En desarrollo) Se predefinirá para mantener consistencia en el contenido principal

**Ejemplo:**
``` html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!--? FontAwesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <!--? Main Style -->
    <link rel="stylesheet" href="./styles/mainStyle.css">
    <!--? Style de la pagina especifica -->
    <link rel="stylesheet" href="./styles/...">
    <title>Titulo de la pagina</title>
</head>
    <!--? Header -->
    <header class="header">
        <div class="headerLogo">
            <img src="./images/SDGKU_Samall_Logo.png" alt="logo">
            <h1>SDGKU Survey Platform</h1>
        </div>
    </header>


<body>
    <!--? Empezar a trabajar aqui -->
    
    <script src="../BE/scripts/index.js"></script>
</body>
</html>s
```

## Guía para crear tu branch de trabajo y hacer merge

### 1. Crear una nueva rama (branch)
```bash
# Asegúrate de estar en la rama principal (main)
git checkout main
git pull origin main

# Crea y cambia a una nueva rama (el nombre debea ser en lo que estes trabajando)
git checkout -b nombre-de-tu-rama
```

### 2. Trabajar en tu rama
- Realiza tus cambios en el código
- Guarda tus cambios frecuentemente:
```bash
git add .
git commit -m "Descripción clara de tus cambios"
```

### 3. Subir tus cambios a GitHub
```bash
git push origin nombre-de-tu-rama
```

### 4. Crear un Pull Request (PR)
1. Ve a GitHub y crea un nuevo Pull Request
2. Selecciona:
   - Base branch: `main`
   - Compare branch: `nombre-de-tu-rama`
3. Describe tus cambios
4. Espera la revisión y aprobación

### 5. Después de la aprobación
```bash
# Vuelve a la rama principal
git checkout main
git pull origin main
```

### Consejos importantes
- Siempre trabaja en una rama separada, nunca en `main`
- Mantén tus commits descriptivos y organizados
- Si hay conflictos, resuélvelos antes de hacer merge
- Pide ayuda si no estás seguro de algo

## Guías Adicionales
- Mantener el código limpio y bien documentado
- Seguir las mejores prácticas de accesibilidad web
- Implementar diseño responsivo para todos los componentes
- Realizar pruebas antes de integrar cambios
- Mantener la consistencia en el diseño y la experiencia de usuario

## Estado del Proyecto
- En desarrollo activo
- Se irán agregando más componentes y funcionalidades según sea necesario
- La documentación se actualizará regularmente con los cambios

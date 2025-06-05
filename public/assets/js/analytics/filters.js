//? <|----------------------------------- Filters -----------------------------------|>


async function overviewFilterLogic() {
    const surveyTypes = await getAllSurveyType();
    const surveyTypeSelect = document.getElementById('programIdOverview');
    surveyTypeSelect.innerHTML = '';

    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = 'All Survey Types';
    surveyTypeSelect.appendChild(allOption);

    surveyTypes.forEach(item => {
        const option = document.createElement('option');
        option.value = item.survey_type_id;
        option.textContent = item.type_name;
        surveyTypeSelect.appendChild(option);
    });

    let dateRangeOption = ['Annual', 'Semiannual', 'Trimester'];
    const select = document.getElementById('selectYearRangeIdOverview');
    const currentYear = new Date().getFullYear();
    const startYear = 2020;
    for (let year = currentYear; year >= startYear; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        select.appendChild(option);
    }
    select.addEventListener('change', async function () {
        const dateRange = document.getElementById('selectRangeTypeIdOverview');
        const selectedRange = dateRange.selectedIndex;
        dateRange.innerHTML = '';
        dateRangeOption.forEach(range => {
            const option = document.createElement('option');
            option.value = range;
            option.textContent = range;
            dateRange.appendChild(option);
        });
    });

    let trimesterRange = ['Select trimester range', 'January - April', 'May - August', 'September - December'];
    let semiannualRange = ['Select semiannual range', 'January - June', 'July - December'];
    const selectElement = document.getElementById('selectRangeTypeIdOverview');
    selectElement.addEventListener('change', async function () {
        const selectedValue = selectElement.selectedIndex;

        if (selectedValue == '0') {
            const rangeOption = document.getElementById('selectDateRangeIdOverview');
            rangeOption.innerHTML = '';
        }
        if (selectedValue == '1') {
            const rangeOption = document.getElementById('selectDateRangeIdOverview');
            rangeOption.innerHTML = '';
            semiannualRange.forEach(range => {
                const option = document.createElement('option');

                option.value = range;
                option.textContent = range;
                rangeOption.appendChild(option);
            });
        }
        if (selectedValue == '2') {
            const rangeOption = document.getElementById('selectDateRangeIdOverview');
            rangeOption.innerHTML = '';
            trimesterRange.forEach(range => {
                const option = document.createElement('option');
                option.value = range;
                option.textContent = range;
                rangeOption.appendChild(option);
            });
        }
    });

}
//?Get Date selected on filters
function getDateRangeSelectedOverview() {
    const selectRange = document.getElementById('selectDateRangeIdOverview');
    const selectYear = document.getElementById('selectYearRangeIdOverview');
    const SelectRangeSemi = document.getElementById('selectRangeTypeIdOverview');
    const TypeIndex = selectYear.selectedIndex;
    const index = selectRange.selectedIndex;
    const valorYear = selectYear.value;
    const completeDateSelected = [];
    const semiOrQuarterly = SelectRangeSemi.selectedIndex;
    let startDateSelect;
    let endDateSelect;
    let startDateMonths;
    let endDateMonths;
    if (semiOrQuarterly === 0) {
        startDateMonths = '-01-01';
        endDateMonths = '-12-31';
        startDateSelect = `${valorYear}${startDateMonths}`;
        endDateSelect = `${valorYear}${endDateMonths}`;
        completeDateSelected[0] = startDateSelect;
        completeDateSelected[1] = endDateSelect;
        return completeDateSelected;
    } else if(semiOrQuarterly === 2){
    switch (index) {
        case 1:
            startDateMonths = '-01-01';
            endDateMonths = '-05-01';
            break;
        case 2:
            startDateMonths = '-05-01';
            endDateMonths = '-09-01';
            break;
        case 3:
            startDateMonths = '-09-01';
            endDateMonths = '-12-31';
            break;
        default:
            startDateMonths = '-01-01';
            endDateMonths = '-12-31';
    }
        startDateSelect = `${valorYear}${startDateMonths}`;
        endDateSelect = `${valorYear}${endDateMonths}`;
        completeDateSelected[0] = startDateSelect;
        completeDateSelected[1] = endDateSelect;
        return completeDateSelected;
    } else if (semiOrQuarterly === 1) {
        switch (index) {
            case 1:
                startDateMonths = '-01-01';
                endDateMonths = '-07-01';
                break;
            case 2:
                startDateMonths = '-07-01';
                endDateMonths = '-12-31';
                break;
            default:
                startDateMonths = '-01-01';
                endDateMonths = '-12-31';
        }
        startDateSelect = `${valorYear}${startDateMonths}`;
        endDateSelect = `${valorYear}${endDateMonths}`;
        completeDateSelected[0] = startDateSelect;
        completeDateSelected[1] = endDateSelect;
        return completeDateSelected;
    }
}


//?Get All programs Names for Overview
async function getAllProgramNames() {
    try {
        const response = await fetch(`/SDGKU-Dashboard/src/models/Response_analysis.php?action=getAllPrograms`);
        const data = await response.json();

        if (data.status === 'success') {
            const names = data.data.map(item => item.name);
            return names;
        }
        throw new Error(data.message || 'Error en los datos');
    } catch (error) {
        console.error("Error in getProgramNames:", error);
        throw error;
    }
}
//?Get All Programs ID for overview
async function getAllProgramIds() {
    try {
        const response = await fetch(`/SDGKU-Dashboard/src/models/Response_analysis.php?action=getAllPrograms`);
        const data = await response.json();

        if (data.status === 'success') {
            const ids = data.data.map(item => item.prog_id);
            return [0, ...ids];
        }

        throw new Error(data.message || 'Error with data');
    } catch (error) {
        console.error("Error in getProgramIds:", error);
        throw error;
    }
}

//?Get All Programs ID for overview
async function getAllSurveyType() {
    try {
        const response = await fetch(`/SDGKU-Dashboard/src/models/Response_analysis.php?action=getAllSurveyType`);
        const data = await response.json();

        if (data.status === 'success') {
            return data.data;
        }

        throw new Error(data.message || 'Error with data');
    } catch (error) {
        console.error("Error in getProgramIds:", error);
        throw error;
    }
}


$(document).ready(function () {
    const lastWeekDate = getLastWeek();
    const today = new Date();
    getClientInfo();
    hideGraphs();
    visualizeDefaultInputsForHourReadingsGraph(lastWeekDate, today);
    getHourReadingsChartFilterData(formatLastWeekDate(), formatTodayDate(), getClientID());
    getGraphPredictionsFilterData(formatLastWeekDate(), formatTodayDate(), getClientID());
    getImbalancesChartFilterData(formatLastWeekDate(), formatTodayDate(), getClientID());
    visualizeDefaultInputsForGraphPrediction(lastWeekDate, today);
    visualizeDefaultInputForImbalanceGraph(lastWeekDate, today);
});

(function addSearchEventToGraphHourReading() {
    $('#searchBtnHourlyGraph').on('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const fromDate = document.querySelector('input[name=fromDate]').value;
        const toDate = document.querySelector('input[name=toDate]').value;
        getHourReadingsChartFilterData(fromDate, toDate, getClientID());
    })
}());

(function addSearchEventToGraphPredictions() {
    $('#searchBtnGraphPrediction').on('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const fromDate = document.querySelector('input[name=fromDateGraphPrediction]').value;
        const toDate = document.querySelector('input[name=toDateGraphPrediction]').value;
        getGraphPredictionsFilterData(fromDate, toDate, getClientID());
    })
}());

(function addSearchEventToImbalances() {
    $('#searchBtnGraphImbalance').on('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const fromDate = document.querySelector('input[name=fromDateImbalanceGraph]').value;
        const toDate = document.querySelector('input[name=toDateImbalanceGraph]').value;
        getImbalancesChartFilterData(fromDate, toDate, getClientID());
    });
}());

function getClientInfo() {
    let clientID = getClientID();
    let dataArr = [];
    $.ajax({
        url: `/api/getClientInfo/${clientID}`,
        method: 'GET',
        dataType: 'json',
        async: false,
        success: function (data) {
            visualizeClientInfo(data);
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
    return dataArr;
}

function getHourReadingsChartFilterData(fromDate, toDate, clientID) {
    if (fromDate == '') {
        fromDate = -1;
    }
    if (toDate == '') {
        toDate = -1;
    }
    $.ajax({
        url: `/api/hour-readings/${fromDate}/${toDate}/${clientID}`,
        method: 'GET',
        dataType: 'json',
        async: false,
        success: function (data) {
            showHourReadingChart(data);
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
}

function getGraphPredictionsFilterData(fromDate, toDate, clientID) {
    if (fromDate == '') {
        fromDate = -1;
    }
    if (toDate == '') {
        toDate = -1;
    }
    $.ajax({
        url: `/api/graph-predictions/${fromDate}/${toDate}/${clientID}`,
        method: 'GET',
        dataType: 'json',
        async: false,
        success: function (data) {
            showGraphPredictionChart(data);
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
}

function getImbalancesChartFilterData(fromDate, toDate, clientID) {
    if (fromDate == '') {
        fromDate = -1;
    }
    if (toDate == '') {
        toDate = -1;
    }
    $.ajax({
        url: `/api/imbalances/getClient/${fromDate}/${toDate}/${clientID}`,
        method: 'GET',
        dataType: 'json',
        async: false,
        success: function (data) {
            showImbalanceChart(data);
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
}

function showHourReadingChart(data) {
    let labels = [];
    let chartData = [];
    let index = 0;
    let dataIterator = 0;
    if (data != undefined) {
        if (data.length == 1) {
            for (let el in data) {
                let date = new Date(data[el]['date']);
                for (let hr in data[el]) {
                    if (index >= 2) {
                        let t = index == 2 ? date : incrementHoursOne(date)
                        let hourObj = {
                            t,
                            y: data[el][hr],
                        }
                        chartData.push(hourObj);
                        labels.push(`${t.getHours()} ч.`);
                    }
                    index += 1;
                }
                index = 0;
            }
        } else if (data.length != 1) {
            for (let el in data) {
                let date = new Date(data[el]['date']);
                if (dataIterator == 0 || dataIterator == Math.ceil(data.length / 2) || dataIterator == data.length - 1) {
                    labels.push(`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`);
                }
                for (let hr in data[el]) {
                    if (index >= 2) {
                        let t = index == 2 ? date : incrementHoursOne(date)
                        let hourObj = {
                            t,
                            y: data[el][hr]
                        }
                        chartData.push(hourObj);
                    }
                    index += 1;
                }
                index = 0;
                dataIterator += 1;
            }
        }
    }
    var ctx = document.getElementById('hour-readings-chart').getContext('2d');
    var config = {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Почасово мерене',
                data: chartData,
                borderWidth: 2,
                backgroundColor: "rgb(255,99,132)",
                borderColor: "#ac3f21"
            }],
        },
        /*
        options: {
            scales: {
              xAxes: [{
                ticks: {
                  maxRotation: 50,
                  minRotation: 30,
                  padding: 10,
                  autoSkip: false,
                  fontSize: 10
                }
              }]
            }
          }
          */
    }
    var myChart = new Chart(ctx, config);

    $('#hour-readings > div.hour-readings-graph-div > form > div > div:nth-child(4) > label > input').click((e) => {
        myChart.destroy();
        var temp = jQuery.extend(true, {}, config);
        if (myChart.config.type == 'line') {
            temp.type = 'bar';
        } else {
            temp.type = 'line';
        }

        myChart = new Chart(ctx, temp);
    })
}

function showGraphPredictionChart(data) {
    let labels = [];
    let chartData = [];
    let index = 0;
    let dataIterator = 0;
    if (data != undefined) {
        if (data.length == 1) {
            for (let el in data) {
                let date = new Date(data[el]['date']);
                for (let hr in data[el]) {
                    if (index >= 2) {
                        let t = index == 2 ? date : incrementHoursOne(date)
                        let hourObj = {
                            t,
                            y: data[el][hr]
                        }
                        chartData.push(hourObj);
                        labels.push(`${t.getHours()} ч.`);
                    }
                    index += 1;
                }
                index = 0;
            }
        } else if (data.length != 1) {
            for (let el in data) {
                let date = new Date(data[el]['date']);
                if (dataIterator == 0 || dataIterator == Math.ceil(data.length / 2) || dataIterator == data.length - 1) {
                    labels.push(`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`);
                }
                for (let hr in data[el]) {
                    if (index >= 2) {
                        let t = index == 2 ? date : incrementHoursOne(date)
                        let hourObj = {
                            t,
                            y: data[el][hr]
                        }
                        chartData.push(hourObj);
                    }
                    index += 1;
                }
                index = 0;
                dataIterator += 1;
            }
        }
    }
    var ctx = document.getElementById('graph-prediction-chart').getContext('2d');
    var config = {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Прогноза',
                data: chartData,
                borderWidth: 2,
                backgroundColor: "rgb(255,99,132)",
                borderColor: "#ac3f21"
            }],
        },
    }
    var myChart = new Chart(ctx, config);

    $('#graph > div.graph-prediction-div > form > div > div:nth-child(4) > label > input').click((e) => {
        myChart.destroy();
        var temp = jQuery.extend(true, {}, config);
        if (myChart.config.type == 'line') {
            temp.type = 'bar';
        } else {
            temp.type = 'line';
        }

        myChart = new Chart(ctx, temp);
    })
}

function showImbalanceChart(data) {
    let labels = [];
    let actualHourData = [];
    let predictionData = [];
    let imbalancesData = [];
    let index = 0;
    let dataIterator = 0;
    const startingIndexActualHourData = 2;
    let indexActualData = 2;
    let indexPrediction = 26;
    const endIndexPrediction = 49;
    const finalIndex = 25;
    if (data != undefined) {
        if (data.length == 1) {
            for (let el in data) {
                let date = new Date(data[el]['date']);
                let valuesData = Object.values(data[el]);
                for (let val of valuesData) {
                    if (index >= startingIndexActualHourData && index <= endIndexPrediction) {
                        if (index > finalIndex) {
                            break;
                        }
                        let t = index == 2 ? date : incrementHoursOne(date)
                        let actualHourObj = {
                            t,
                            y: valuesData[indexActualData]
                        }
                        let predictionObj = {
                            t,
                            y: valuesData[indexPrediction]
                        }
                        let imbalanceData = {
                            t,
                            y: valuesData[indexPrediction] - valuesData[indexActualData]
                        }

                        actualHourData.push(actualHourObj);
                        predictionData.push(predictionObj);
                        imbalancesData.push(imbalanceData);
                        labels.push(`${t.getHours()} ч.`);

                        indexActualData += 1;
                        indexPrediction += 1;
                    }
                    index += 1;
                }
                index = 0;
            }
        } else if (data.length != 1) {
            for (let el in data) {
                let date = new Date(data[el]['date']);
                if (dataIterator == 0 || dataIterator == Math.ceil(data.length / 2) || dataIterator == data.length - 1) {
                    labels.push(`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`);
                }
                for (let hr in data[el]) {
                    if (index >= 2) {
                        let t = index == 2 ? date : incrementHoursOne(date)
                        let hourObj = {
                            t,
                            y: data[el][hr]
                        }
                        actualHourData.push(hourObj);
                    }
                    index += 1;
                }
                index = 0;
                dataIterator += 1;
            }
        }
    }
    var ctx = document.getElementById('imbalance-chart').getContext('2d');
    var config = {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Настоящи',
                data: actualHourData,
                borderWidth: 2,
                backgroundColor: "rgb(255,99,132)",
                borderColor: "#ac3f21"
            }, {
                label: 'Прогнози',
                data: predictionData,
                borderWidth: 2,
                backgroundColor: "#9c1de7",
                borderColor: "#9c1de7"
            }, {
                label: 'Небаланс',
                data: imbalancesData,
                borderWidth: 2,
                backgroundColor: "#f3f169",
                borderColor: "#f3f169",
                hidden: true
            }],
        },
    }
    var myChart = new Chart(ctx, config);

    $('#imbalance > div.imbalance-graph-div > form > div > div:nth-child(4) > label > input').click((e) => {
        myChart.destroy();
        var temp = jQuery.extend(true, {}, config);
        if (myChart.config.type == 'line') {
            temp.type = 'bar';
        } else {
            temp.type = 'line';
        }
        myChart = new Chart(ctx, temp);
    })
}

(function addFullCalendars() {
    document.addEventListener('DOMContentLoaded', function () {
        var calendarEl = document.getElementById('calendar-hourly');
        var calendar = new FullCalendar.Calendar(calendarEl, {
            eventLimit: true,
            eventLimit: 1,
            eventLimitText: 'Има мерене',
            eventLimitClick: 'day',
            allDaySlot: false,
            eventOrder: 'groupId',
            events: getHourReadingsByID(),
            plugins: ['dayGrid', 'timeGrid'],
            header: {
                left: 'prev,next today',
                center: 'title',
                right: 'prev, dayGridMonth,timeGridDay, next',

            },
            contentHeight: 'auto',
        });
        calendar.render();
        $('body > div.container.mt-3 > ul > li:nth-child(1) > a').click();
    });

    document.addEventListener('DOMContentLoaded', function () {
        var calendarEl = document.getElementById('calendar-prediction');
        var calendar = new FullCalendar.Calendar(calendarEl, {
            eventLimit: true,
            eventLimit: 1,
            eventLimitText: 'Има график',
            eventLimitClick: 'day',
            allDaySlot: false,
            eventOrder: 'groupId',
            events: getGraphPredictions(),
            plugins: ['dayGrid', 'timeGrid'],
            header: {
                left: 'prev,next today',
                center: 'title',
                right: 'prev, dayGridMonth,timeGridDay, next',

            },
            contentHeight: 'auto',
        });
        calendar.render();
    });

    document.addEventListener('DOMContentLoaded', function () {
        var calendarEl = document.getElementById('calendar-imbalance');
        var calendar = new FullCalendar.Calendar(calendarEl, {
            eventLimit: true,
            eventLimit: 1,
            eventLimitText: 'Има небанс',
            eventLimitClick: 'day',
            allDaySlot: false,
            eventOrder: 'groupId',
            events: getImbalances(),
            plugins: ['dayGrid', 'timeGrid'],
            header: {
                left: 'prev,next today',
                center: 'title',
                right: 'prev, dayGridMonth,timeGridDay, next',

            },
            contentHeight: 'auto'
        });
        calendar.render();
    });
}())

function getHourReadingsByID() {
    let clientID = getClientID();
    let dataArr = [];
    $.ajax({
        url: `/api/hour-readings/getClient/${clientID}`,
        method: 'GET',
        dataType: 'json',
        async: false,
        success: function (data) {
            dataArr = [...processDataHourly(data)];
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
    return dataArr;
}

function getGraphPredictions() {
    let clientID = getClientID();
    let dataArr = [];
    $.ajax({
        url: `/api/graph-predictions/getClient/${clientID}`,
        method: 'GET',
        dataType: 'json',
        async: false,
        success: function (data) {
            dataArr = [...processDataGraphPredictions(data)];
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
    return dataArr;
}

function getImbalances() {
    let clientID = getClientID();
    let dataArr = [];
    $.ajax({
        url: `/api/imbalances/getClient/${clientID}`,
        method: 'GET',
        dataType: 'json',
        async: false,
        success: function (data) {

            dataArr = [...processDataImbalances(data)];
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
    return dataArr;
}

function visualizeClientInfo(data) {
    $('#info > div.container > div:nth-child(2) > input').val(data['client_name']);
    $('#info > div.container > div:nth-child(3) > input').val(data['ident_code']);
    $('#info > div.container > div:nth-child(4) > input').val(data['profile_id']);
    $('#info > div.container > div:nth-child(5) > input').val(data['metering_type'] == 2 ? 'СТП' : 'Почасово');
    $('#info > div.container > div:nth-child(6) > input').val(data['erp_type'] == 1 ? 'ИВН' : data['erp_type'] == 2 ? 'ЧЕЗ' : 'ЕнергоПРО');
    if (data['is_manufacturer']) {
        $('#squaredThree').prop('checked', true);
    }
}

function getClientID() {
    let lastIndexOfIncline = window.location.href.lastIndexOf('/');
    return window.location.href.substr(lastIndexOfIncline + 1);
}

const colors = {
    blue: '#aa62ea',
    red: '#ff4d4d'
}

function processDataHourly(data) {
    writeHourReadingsDailyHeader(data);
    let dataArr = [];
    let currHourReading = [];
    for (let el in data) {
        currHourReading = [];
        let currHourDate = new Date(data[el].date);
        let diff = data[el].diff;
        let type = data[el].type;
        let i = 0;
        const startIndexHourReadings = 11;
        const endIndexHourReadings = 34;
        for (let [key, value] of Object.entries(data[el])) {
            if (i > endIndexHourReadings) {
                break;
            }
            if (i >= startIndexHourReadings && i <= endIndexHourReadings) {
                currHourReading = {
                    groupId: diff,
                    id: key,
                    title: value === -1 ? title = 'Няма стойност' : `Стойност: ${value} ${type===0?'Активна':'Реактивна'}`,
                    start: Number(currHourDate),
                    end: Number(currHourDate) + 3600000,
                    backgroundColor: diff === 0 ? colors.blue : colors.red
                }
                incrementHoursOne(currHourDate);
            }
            dataArr.push(currHourReading);
            i += 1;
        }
        i = 0;
    }

    return dataArr;
}

function processDataGraphPredictions(data) {
    writeHourReadingsDailyHeader(data);
    console.log(data);
    let dataArr = [];
    let currHourReading = [];
    for (let el in data) {
        currHourReading = [];
        let currHourDate = new Date(data[el].date);
        const startIndexGraphPrediction = 11;
        const endIndexGraphPrediction = 34;
        let diff = data[el].diff;
        let i = 0;
        for (let [key, value] of Object.entries(data[el])) {
            if (i > endIndexGraphPrediction) {
                break;
            }
            if (i >= startIndexGraphPrediction && i <= endIndexGraphPrediction) {
                currHourReading = {
                    groupId: diff,
                    id: key,
                    title: value === -1 ? title = 'Няма стойност' : `Стойност: ${value}`,
                    start: Number(currHourDate),
                    end: Number(currHourDate) + 3600000,
                    backgroundColor: colors.blue
                }
                incrementHoursOne(currHourDate);
            }
            dataArr.push(currHourReading);
            i += 1;
        }
        i = 0;
    }

    return dataArr;
}

function processDataImbalances(data) {
    writeImbalancesHeader(data);
    let dataArr = [];
    let currHourReading = [];
    for (let el in data) {
        currHourReading = [];
        let currHourDate = new Date(data[el].date);
        let currHourReadingVal = 2;
        let currHourPredictionVal = 26;
        let objVals = Object.values(data[el]);
        let iterator = 0;

        for (let val of objVals) {
            if (iterator >= 2 && iterator < 26) {
                const currImbalance = objVals[currHourPredictionVal] - objVals[currHourReadingVal];
                currHourReading = {
                    id: iterator,
                    title: currImbalance,
                    start: Number(currHourDate),
                    end: Number(currHourDate) + 3600000,
                    backgroundColor: colors.blue
                }
                dataArr.push(currHourReading);
                incrementHoursOne(currHourDate);
                currHourReadingVal += 1;
                currHourPredictionVal += 1;
            }
            iterator += 1;
        }
    }
    return dataArr;
}

function incrementHoursOne(date) {
    return new Date(date.setHours(date.getHours() + 1));
}

function decrementHoursBy23(date) {
    return date.setHours(date.getHours() - 23);
}

function writeHourReadingsDailyHeader(data) {
    $('#hour-readings > h1').text(`Мерения по часове за клиент: ${data[0].ident_code}`);
}

function writeImbalancesHeader(data) {
    $('#imbalance > h1').text(`Небаланси за клиент: ${data[0].ident_code}`)
}

(function switchHourReadingCalendarAndGraph() {
    $('#hour-readings > label > span.switch-label').on('click', () => {
        if ($('.hour-readings-graph-div').css('display') == 'none') {
            $('#hour-readings > div.row').css('display', 'none');
            $('.hour-readings-graph-div').css('display', 'block');
        } else {
            $('#hour-readings > div.row').css('display', 'flex');
            $('.hour-readings-graph-div').css('display', 'none');
        }
    })
}());

(function switchGraphPredictionCalendarAndGraph() {
    $('#graph > label > span.switch-label').on('click', () => {
        if ($('.graph-prediction-div').css('display') == 'block') {
            $('.graph-prediction-div').css("display", "none");
            $('.graphRow-calendar').css("display", "block");
        } else {
            $(".graph-prediction-div").css("display", "block");
            $('.graphRow-calendar').css("display", "none");
        }
    })
}());

(function switchImbalanceCalendarAndGraph() {
    $('#imbalance > label > input').on('click', () => {
        if ($('#imbalance > div.row').css('display') == 'flex') {
            $('#imbalance > div.row').css("display", "none");
            $('#imbalance > div.imbalance-graph-div').css("display", "block");
        } else {
            $("#imbalance > div.row").css("display", "flex");
            $('#imbalance > div.imbalance-graph-div').css("display", "none");
        }
    })
})();

function visualizeDefaultInputForGraphs() {
    const lastWeekDate = getLastWeek();
    const today = new Date();
    $('#hour-readings > div.hour-readings-graph-div > form > div > div.offset-1.col-md-3 > input[type=date]').val(`${lastWeekDate.getFullYear()}-${lastWeekDate.getMonth()+1<10?`0${lastWeekDate.getMonth()+1}`:lastWeekDate.getMonth()+1}-${lastWeekDate.getDate()<10?`0${lastWeekDate.getDate()}`:lastWeekDate.getDate()}`);
    $('#hour-readings > div.hour-readings-graph-div > form > div > div:nth-child(2) > input[type=date]').val(`${today.getFullYear()}-${(today.getMonth()+1)<10? `0${today.getMonth()+1}`: today.getMonth()+1}-${today.getDate()<10?`0${today.getDate()}`:today.getDate()}`);
}

function formatTodayDate() {
    return `${new Date().getFullYear()}-${(new Date().getMonth()+1)<10?`0${new Date().getMonth()+1}`:new Date().getMonth()+1}-${new Date().getDate()<10?`0${new Date().getDate()}`:new Date().getDate()}`
}

function formatLastWeekDate() {
    return `${getLastWeek().getFullYear()}-${(getLastWeek().getMonth()+1)<10?`0${getLastWeek().getMonth()+1}`:getLastWeek().getMonth()+1}-${getLastWeek().getDate()<10?`0${getLastWeek().getDate()}`:getLastWeek().getDate()}`
}

function visualizeDefaultInputsForHourReadingsGraph(lastWeekDate, today) {
    $('#hour-readings > div.hour-readings-graph-div > form > div > div.offset-1.col-md-3 > input[type=date]').val(`${lastWeekDate.getFullYear()}-${lastWeekDate.getMonth()+1<10?`0${lastWeekDate.getMonth()+1}`:lastWeekDate.getMonth()+1}-${lastWeekDate.getDate()<10?`0${lastWeekDate.getDate()}`:lastWeekDate.getDate()}`);
    $('#hour-readings > div.hour-readings-graph-div > form > div > div:nth-child(2) > input[type=date]').val(`${today.getFullYear()}-${(today.getMonth()+1)<10? `0${today.getMonth()+1}`: today.getMonth()+1}-${today.getDate()<10?`0${today.getDate()}`:today.getDate()}`);
}

function visualizeDefaultInputsForGraphPrediction(lastWeekDate, today) {
    $('input[name=fromDateGraphPrediction]').val(`${lastWeekDate.getFullYear()}-${lastWeekDate.getMonth()+1<10?`0${lastWeekDate.getMonth()+1}`:lastWeekDate.getMonth()+1}-${lastWeekDate.getDate()<10?`0${lastWeekDate.getDate()}`:lastWeekDate.getDate()}`);
    $('input[name=toDateGraphPrediction]').val(`${today.getFullYear()}-${(today.getMonth()+1)<10? `0${today.getMonth()+1}`: today.getMonth()+1}-${today.getDate()<10?`0${today.getDate()}`:today.getDate()}`);
}

function visualizeDefaultInputForImbalanceGraph(lastWeekDate, today) {
    $('input[name=fromDateImbalanceGraph]').val(`${lastWeekDate.getFullYear()}-${lastWeekDate.getMonth()+1<10?`0${lastWeekDate.getMonth()+1}`:lastWeekDate.getMonth()+1}-${lastWeekDate.getDate()<10?`0${lastWeekDate.getDate()}`:lastWeekDate.getDate()}`);
    $('input[name=toDateImbalanceGraph]').val(`${today.getFullYear()}-${(today.getMonth()+1)<10? `0${today.getMonth()+1}`: today.getMonth()+1}-${today.getDate()<10?`0${today.getDate()}`:today.getDate()}`);
}

function hideGraphs() {
    $('.hour-readings-graph-div').css('display', 'none');
    $('.graph-prediction-div').css('display', 'none');
    $('#imbalance > div.imbalance-graph-div').css('display', 'none');
}

function findGetParameter(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function getLastWeek() {
    var today = new Date();
    var lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    return lastWeek;
}
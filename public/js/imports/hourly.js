;
(function customizeUploadBTN() {
    $('.labelBtn').on('click', () => {
        $('#upload-excel').click();
    });
})();

const companies = {
    ENERGO_PRO: 'ENERGO_PRO',
    EVN: 'EVN',
    CEZ: 'CEZ'
};

const importTypes = {
    hour_reading: {
        CEZ: 'CEZ',
        EVN_EnergoPRO: 'EVN_EnergoPRO',
    },
    graph: 'graph'
}

class Company {
    constructor() {
        this.company = '';
        this.erpType = '';
    }
    getCompany() {
        return this.company;
    }
    getErpType() {
        return this.erpType;
    }
    setCompany(company) {
        this.company = company;
        return this;
    }
    setErpType(type) {
        this.erpType = type;
        return this;
    }
}

class GraphPrediction {
    constructor() {
        this.company = '';
        this.name = '';
        this.ERP = '';
    }
    getCompany() {
        return this.company;
    }
    getType() {
        return this.ERP;
    }
    setCompany(company) {
        this.company = company;
        return this;
    }
    setType(ERP) {
        this.ERP = ERP;
        return this;
    }
}

let company = new Company();
let graphPrediction = new GraphPrediction();

Array.prototype.insert = function (index, item) {
    this.splice(index, 0, item);
};

function showUploadBlocks() {
    $('#hourly-import').removeClass('invisible');
    $('div.invisible').removeClass('invisible');
}

function hideUploadBlocks() {
    $('#hourly-import').addClass('invisible');
    $('body > div.container.mt-3 > div > div > div.card-body > div:nth-child(7)').addClass('invisible');
}

function configurateBlocksForHourReadings() {
    $('.configurate-options').css('display', 'block');
}

function configBlocksForGraphPrediction() {
    $('.configurate-options').css('display', 'none');
}

($('body').click(() => {

    if ($('#energo-pro').is(':checked')) {
        if ($('#hour-reading').is(':checked')) {
            handleEventListeners(importTypes.hour_reading.EVN_EnergoPRO);
        } else if ($('#graph').is(':checked')) {
            handleEventListeners(importTypes.graph);
        }
        company.setCompany('ENERGO_PRO').setErpType(3);
        graphPrediction.setCompany('ENERGO_PRO').setType(3);
    } else if ($('#evn').is(':checked')) {
        if ($('#hour-reading').is(':checked')) {
            handleEventListeners(importTypes.hour_reading.EVN_EnergoPRO);
        } else if ($('#graph').is(':checked')) {
            handleEventListeners(importTypes.graph);
        }
        company.setCompany('EVN').setErpType(1);
        graphPrediction.setCompany('EVN').setType(1);
    } else if ($('#cez').is(':checked')) {
        if ($('#hour-reading').is(':checked')) {
            handleEventListeners(importTypes.hour_reading.CEZ);
        } else if ($('#graph').is(':checked')) {
            handleEventListeners(importTypes.graph);
            graphPrediction.setCompany('CEZ').setType(2);
        }
        company.setCompany('CEZ').setErpType(2);
    } else if ($('#graph').prop('checked')) {
        handleEventListeners(importTypes.graph);
    }
    const radioChecker = validateRadioBTNs();
    radioChecker ? showUploadBlocks() : hideUploadBlocks();
    configurateOptions();
}));

function configurateOptions() {
    if ($('#graph').prop('checked')) {
        configBlocksForGraphPrediction();
    }
    if ($('#hour-reading').prop('checked')) {
        configurateBlocksForHourReadings();
    }
}

function validateRadioBTNs() {
    let importDataType = false;
    $("input[name='importDataType']").each(function () {
        const checked = $(this).prop('checked');
        checked ? importDataType = true : '';
    });
    let importDataERP = false;
    $("input[name='data-erp']").each(function () {
        const checked = $(this).prop('checked');
        checked ? importDataERP = true : '';
    });
    if ((importDataERP && importDataType) || $('#graph').prop('checked')) {
        return true;
    }
    return false;
}

function processHourReadingCEZ(e) {
    const operator = 2;
    const meteringType = 1; // Hour-Reading
    const profileID = 0;
    const isManufacturer = 0;
    const isBusiness = 0;
    e.stopPropagation();
    e.preventDefault();
    let files = '';
    let f = '';
    try {
        files = e.dataTransfer.files,
            f = files[0];
    } catch (e) {
        files = document.getElementById('upload-excel').files,
            f = document.getElementById('upload-excel').files[0];
    }
    var reader = new FileReader();
    let fileName = '';
    try {
        fileName = e.dataTransfer.files[0].name
    } catch (e) {
        fileName = document.getElementById('upload-excel').files[0].name;
    }
    let extension = fileName.slice(fileName.lastIndexOf('.') + 1);
    if (extension === 'xlsx' || extension === 'xls') {
        reader.onload = function (e) {
            var data = new Uint8Array(e.target.result);
            var workbook = XLSX.read(data, {
                type: 'array'
            });
            let first_sheet_name = workbook.SheetNames[0];
            var worksheet = workbook.Sheets[first_sheet_name];
            let colSize = getCols(workbook['Sheets'][`${first_sheet_name}`])[0].length;
            let nameOfFirstCell = worksheet['A1'].v;
            //    validateDocumentForCEZFunc(colSize, nameOfFirstCell);

            let cl = [];
            let clientsIDs = [];
            let allClients = [];
            let allHourReadings = [];
            let currHourValues = [];
            let currHourReading = [];
            let arr = getCols(workbook['Sheets'][`${first_sheet_name}`]);
            let client = [];
            let endOfDates;
            for (let g = 4; g < arr[0].length; g += 1) {
                if (arr[0][g] == undefined) {
                    endOfDates = g - 1;
                    break;
                }
            }
            for (let i = 1; i < arr.length; i += 1) {
                for (let x = 4; x < endOfDates; x += 1) {
                    let currDateHelper = `${arr[0][x]}`;
                    let currDate = new Date(currDateHelper.split(" ")[0]);
                    for (let val = 0; val < 24; val += 1) {
                        let undefinedHour = undefined;
                        try {
                            var currHourValue = (arr[0][x].split(' ')[1].split(':')[0]) - 1 === -1 ? 23 : (arr[0][x].split(' ')[1].split(':')[0]) - 1;
                        } catch (e) {
                            currHourValue = null;
                        }
                        try {
                            var nextHourValue = (arr[0][x + 1].split(' ')[1].split(':')[0]) - 1 === -1 ? 23 : (arr[0][x + 1].split(' ')[1].split(':')[0]) - 1;
                        } catch (e) {
                            nextHourValue = null;
                        }

                        if (currHourValue === nextHourValue) {
                            undefinedHour = Number(arr[i][x]) + Number(arr[i][x + 1]);
                            x += 1;
                        } else if (currHourValue != val) {
                            undefinedHour = null;
                            x -= 1;
                        }

                        currHourObj = {
                            currHour: val,
                            currValue: undefinedHour === null ? undefinedHour : arr[i][x]
                        }
                        currHourValues.push(currHourObj);
                        x += 1;
                    }
                    let formattedDate = `${currDate.getFullYear()}-${currDate.getMonth()+1}-${currDate.getDate()}`;
                    if (!formattedDate.includes('NaN')) {
                        let clientName = arr[i][0];
                        let clientID = arr[i][1];
                        let typeEnergy = arr[i][2];
                        typeEnergy.includes('Активна енергия') ? typeEnergy = 0 : typeEnergy = 1;
                        currHourReading.push(clientName, clientID, typeEnergy, formattedDate, currHourValues, new Date());
                        client.push(0, clientName, clientID, meteringType, profileID, operator, isManufacturer, isBusiness, new Date());
                        allClients.push(client);
                        allHourReadings.push(currHourReading);
                        currHourValues = [];
                        currHourReading = [];
                        clientsIDs.push(clientID);
                        currHourObj = {};
                        client = [];
                        x -= 1;
                    }
                }
            }
            console.log(allClients)
            saveClientsToDB(allClients);
            cl = getClientsFromDB(convertClientIDsToString(clientsIDs));
            changeClientIdForHourReadings(allHourReadings, cl);
            saveHourReadingsToDB(allHourReadings);
        };
        reader.readAsArrayBuffer(f);
    } else {
        throwErrorForInvalidFileFormat();
    }
}

function processHourReadingEVN_EnergoPRO(e) {
    const meteringType = 1; // Hour-Reading
    const profileID = 0;
    const isManufacturer = 0;
    const isBusiness = 0;
    e.stopPropagation();
    e.preventDefault();
    let files = '';
    let f = '';
    try {
        files = e.dataTransfer.files,
            f = files[0];
    } catch (e) {
        files = document.getElementById('upload-excel').files,
            f = document.getElementById('upload-excel').files[0];
    }
    let allHourReadings = [];
    let clientIDs = [];
    let clientsALL = [];
    for (let z = 0; z < files.length; z += 1) {
        f = files[z];
        var reader = new FileReader();
        let fileName = '';
        try {
            fileName = e.dataTransfer.files[z].name
        } catch (e) {
            fileName = document.getElementById('upload-excel').files[z].name;
        }
        let extension = fileName.slice(fileName.lastIndexOf('.') + 1);
        if (extension === 'xlsx' || extension === 'xls') {
            reader.onload = function (e) {
                let data = new Uint8Array(e.target.result);
                let workbook = XLSX.read(data, {
                    type: 'array'
                });
                let first_sheet_name = workbook.SheetNames[0];
                let worksheet = workbook.Sheets[first_sheet_name];
                let clientName;
                let clientID;
                let colSize = getCols(workbook['Sheets'][`${first_sheet_name}`])[0].length;
                if (Object.values(companies).indexOf(company.getCompany()) < 0) {
                    notification('Избери компания', 'error');
                } else {
                    if (company.getCompany() === companies.EVN) {
                        clientName = '';
                        clientID = worksheet['A2'].v;
                        console.log(clientID);
                    } else if (company.getCompany() === companies.ENERGO_PRO) {
                        clientName = worksheet['A1'].v;
                        clientID = (worksheet['A2'].v).split(" ")[2];
                    }
                    validateDocumentForEVN_EnergoPROFunc(clientID, clientName, colSize);
                    let arr = getRows(workbook['Sheets'][`${first_sheet_name}`]);
                    let currActiveEnergyValues = [];
                    let currReactiveEnergyValues = [];
                    let currHourReadingActive = [];
                    let currHourReadingReactive = [];
                    const operator = company.getErpType();
                    for (let x = 4; x < arr[0].length; x += 1) {
                        let currDateHelper = `${arr[0][x]}`;
                        let splitHelper = currDateHelper.split(" ")[0].split('.');
                        let currDate = new Date(`${splitHelper[1]}.${splitHelper[0]}.${splitHelper[2]}`);
                        for (let val = 0; val < 24; val += 1) {
                            let undefinedHour = undefined;
                            let reactiveEnergyHour = undefined;
                            try {
                                var currHourValue = (arr[0][x].split(' ')[1].split(':')[0]) - 1 === -1 ? 23 : (arr[0][x].split(' ')[1].split(':')[0]) - 1;
                            } catch (e) {
                                currHourValue = null;
                            }

                            try {
                                var nextHourValue = (arr[0][x + 1].split(' ')[1].split(':')[0]) - 1 === -1 ? 23 : (arr[0][x + 1].split(' ')[1].split(':')[0]) - 1;
                            } catch (e) {
                                nextHourValue = null;
                            }

                            if (currHourValue === nextHourValue) {
                                undefinedHour = Number(arr[1][x]) + Number(arr[1][x + 1]);
                                reactiveEnergyHour = Number(arr[2][x] + Number(arr[2][x + 1]));
                                x += 1;
                            } else if (currHourValue != val) {
                                undefinedHour = null;
                                reactiveEnergyHour = null;
                                x -= 1;
                            }

                            currHourActiveEnergyObj = {
                                currHour: val,
                                currValue: undefinedHour === null ? undefinedHour : arr[1][x]
                            }
                            currReactiveEnergyObj = {
                                currHour: val,
                                currValue: reactiveEnergyHour === null ? reactiveEnergyHour : arr[2][x] || 0
                            }
                            currActiveEnergyValues.push(currHourActiveEnergyObj);
                            currReactiveEnergyValues.push(currReactiveEnergyObj);
                            x += 1;
                        }
                        let formattedDate = `${currDate.getFullYear()}-${currDate.getMonth()+1}-${currDate.getDate()}`;
                        if (!formattedDate.includes('NaN')) {
                            currHourReadingActive.push(clientName, clientID, 0, formattedDate, currActiveEnergyValues, new Date());
                            currHourReadingReactive.push(clientName, clientID, 1, formattedDate, currReactiveEnergyValues, new Date());
                            allHourReadings.push(currHourReadingActive);
                            allHourReadings.push(currHourReadingReactive);
                            currHourReadingActive = [];
                            currHourReadingReactive = [];
                            currActiveEnergyValues = [];
                            currReactiveEnergyValues = [];
                            currHourActiveEnergyObj = {};
                            currReactiveEnergyObj = {};
                            x -= 1;
                        }
                    }
                    let client = [];
                    clientIDs.push(clientID);
                    client.push(0, clientName, clientID, meteringType, profileID, operator, isManufacturer, isBusiness, new Date());
                    clientsALL.push(client);
                    // Last Iteration of files []
                    if (z + 1 === files.length) {
                        console.log(clientsALL);
                        console.log(allHourReadings);
                        saveClientsToDB(clientsALL);
                        let cl;
                        cl = getClientsFromDB(convertClientIDsToString(clientIDs));
                        changeClientIdForHourReadings(allHourReadings, cl);
                        saveHourReadingsToDB(allHourReadings);
                        console.log(allHourReadings);
                    }
                };
            }
            reader.readAsArrayBuffer(f);
        } else {
            throwErrorForInvalidFileFormat();
        }
    }
}

function processGraphFile(e) {
    e.stopPropagation();
    e.preventDefault();
    const meteringType = 1; // Hour-Reading
    const profileID = 0;
    const isManufacturer = 0;
    const isBusiness = 0;
    let files = '';
    let f = '';
    try {
        files = e.dataTransfer.files,
            f = files[0];
    } catch (e) {
        files = document.getElementById('upload-excel').files,
            f = document.getElementById('upload-excel').files[0];
    }
    var reader = new FileReader();
    let fileName = '';
    try {
        fileName = e.dataTransfer.files[z].name
    } catch (e) {
        fileName = document.getElementById('upload-excel').files[0].name;
    }
    let helperDate = fileName.split('.');
    let documentDate = `${helperDate[1]}.${helperDate[0]}.${helperDate[2]}`;
    let extension = fileName.slice(fileName.lastIndexOf('.') + 1);

    if (extension === 'xlsx' || extension === 'xls') {
        reader.onload = function (e) {
            fileName = fileName.replace(extension, "");
            fileName = fileName.substring(0, fileName.length - 1);
            var data = new Uint8Array(e.target.result);
            var workbook = XLSX.read(data, {
                type: 'array'
            });

            let first_sheet_name = workbook.SheetNames[0];
            var worksheet = workbook.Sheets[first_sheet_name];
            let fifthCell = worksheet['A5'].v;

            let client = [];
            let clientsAll = [];
            let clientID;
            let allGraphPredictions = [];
            let allESOGraphPredictions = [];
            let graphHourPrediction = [];
            let esoGraphPrediction = [];
            let currHourValues = [];
            let type = 1;
            let arr = getCols(workbook['Sheets'][`${first_sheet_name}`]);

            //  validateDocumentForGraphFunc(fifthCell);
            for (let i = 1; i < arr.length; i += 1) {
                let clientName = arr[i][0];
                let clientIdentCode = arr[i][1];
                if (clientIdentCode != null && clientIdentCode != undefined && clientName != null && clientName != undefined) {
                    const currentErp = convertERPTypeForGraphPrediction(arr[i][2]);
                    client.push(0, clientName, clientIdentCode, meteringType, profileID, currentErp, isManufacturer, isBusiness, new Date());
                    clientsAll.push(client);
                    client = [];
                }
            }

            saveClientsToDB(clientsAll);
            let val = 0;
            let date = new Date(documentDate);
            for (let i = 1; i < arr.length; i += 1) {
                const clientName = arr[i][0];
                const ident_code = arr[i][1];
                const currentErp = convertERPTypeForGraphPrediction(arr[i][2]);
                if (clientName == '' || clientName == undefined || clientName == null ||
                    ident_code == '' || ident_code == undefined || ident_code == null) {
                    continue;
                } else {
                    for (let y = 3; y < arr[i].length; y += 1) {
                        try {
                            var currHourHelper = arr[0][y].split(":");
                        } catch (err) {
                            break;
                        }

                        let currHourValue = currHourHelper[0] - 1;
                        if (currHourValue == -1) {
                            currHourValue = 23;
                        }
                        let undefinedHour = undefined;

                        try {
                            var nextHourValue = Number(arr[0][y + 1].split(':')[0].split(':')[0]) - 1 === -1 ? 23 : Number(arr[0][y + 1].split(':')[0].split(':')[0]) - 1;
                        } catch (e) {
                            nextHourValue = null;
                        }

                        if (currHourValue === nextHourValue) {
                            undefinedHour = Number(arr[i][y]) + Number(arr[i][y + 1]);
                            y += 1;
                        } else if (currHourValue != val) {
                            undefinedHour = null;
                            y -= 1;
                        }

                        let currValue = arr[i][y];
                        let currHourObj = {
                            currHour: currHourValue,
                            currValue: undefinedHour === null ? undefinedHour : currValue
                        }
                        currHourValues.push(currHourObj);
                        val += 1;
                        if (val > 23) {
                            val = 0;
                        }
                    }
                    if (ident_code != '' && ident_code != undefined && ident_code != null) {
                        clientID = getClientIDFromDB(ident_code);
                        let createdDate = new Date();
                        if (currentErp != 4) {
                            graphHourPrediction.push(clientID, date, currHourValues, type, currentErp, createdDate);
                            allGraphPredictions.push(graphHourPrediction);
                            graphHourPrediction = [];
                        } else if (currentErp == 4) {
                            esoGraphPrediction.push(clientID, date, currHourValues, currentErp, createdDate);
                            allESOGraphPredictions.push(esoGraphPrediction);
                            esoGraphPrediction = [];
                        }
                        currHourValues = [];
                    }
                }
            }
            if (allGraphPredictions.length > 0) {
                saveGraphPredictionsToDB(allGraphPredictions);
            }
            if (allESOGraphPredictions.length > 0) {
                saveESOGraphPredictions(allESOGraphPredictions);
            }
            return;
        };
        reader.readAsArrayBuffer(f);
    } else {
        throwErrorForInvalidFileFormat();
    }
}

function getRows(sheet) {
    var result = [];
    var row;
    var rowNum;
    var colNum;
    var range = XLSX.utils.decode_range(sheet['!ref']);
    for (colNum = range.s.c; colNum <= range.e.c; colNum++) {
        row = [];
        for (rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
            var nextCell = sheet[
                XLSX.utils.encode_cell({
                    r: rowNum,
                    c: colNum
                })
            ];
            if (typeof nextCell === 'undefined') {
                row.push(void 0);
            } else row.push(nextCell.w);
        }
        result.push(row);
    }
    return result;
}

function getCols(sheet) {
    var result = [];
    var row;
    var rowNum;
    var colNum;
    var range = XLSX.utils.decode_range(sheet['!ref']);
    for (rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
        row = [];
        for (colNum = range.s.c; colNum <= range.e.c; colNum++) {
            var nextCell = sheet[
                XLSX.utils.encode_cell({
                    r: rowNum,
                    c: colNum
                })
            ];
            if (typeof nextCell === 'undefined') {
                row.push(void 0);
            } else row.push(nextCell.w);
        }
        result.push(row);
    }
    return result;
}

function convertERPTypeForGraphPrediction(erp) {
    if (erp && erp != null && erp != undefined && erp != '') {
        erp = erp.replace(/ /g, '');
    } else {
        return null
    }

    let result;
    switch (erp) {
        case 'EVN':
        case 'ИВН':
        case 'IVN':
            result = 1;
            break;
        case 'CEZ':
        case 'ЧЕЗ':
        case 'ЧЕЗ ':
            result = 2;
            break;
        case 'ЕНЕРГО-ПРО':
        case 'ЕНЕРГОПРО':
        case 'ENERGOPRO':
        case 'ENERGO-PRO':
        case 'ЕнергоПРО':
            result = 3;
            break;
        case 'ESO':
        case 'ЕСО':
            result = 4;
            break;
    }
    return result;
}

function getClientIDFromDB(client) {
    notification('Зареждане', 'loading');
    let retVal;
    $.ajax({
        url: '/api/getSingleClient',
        method: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        async: false,
        data: JSON.stringify({
            ident_code: client
        }),
        success: function (data) {
            retVal = data;
        },
        error: function (jqXhr, textStatus, errorThrown) {
            notification(errorThrown, 'error');
        }
    });
    return retVal;
};

function throwErrorForInvalidFileFormat() {
    notification('Invalid file format', 'error');
}

function changeClientIdForHourReadings(allHourReadings, cl) {
    allHourReadings.forEach(hour_reading => {
        if (cl != undefined) {
            for (let i = 0; i < cl.length; i++) {
                if (cl[i].ident_code == hour_reading['1']) {
                    hour_reading['1'] = cl[i].id;
                }
            }
        }
    });
};

function getClientsFromDB(clients) {
    notification('Зареждане', 'loading');
    let retVal;
    $.ajax({
        url: '/api/getClients',
        method: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        async: false,
        data: JSON.stringify(clients),
        success: function (data) {
            retVal = data;
        },
        error: function (jqXhr, textStatus, errorThrown) {
            notification(errorThrown, 'error');
        }
    });
    return retVal;
};

function convertClientIDsToString(clientIDs) {
    return clientIDs.map(clientID => convertClientIDToString(clientID));
}

function convertClientIDToString(clientID) {
    return `"${clientID}"`;
}

function filterClients(clientsAll) {
    let filteredclientsAll = [];
    let filteredClients = '';
    let isFalse = false;

    for (let i = 0; i <= clientsAll.length; i += 1) {
        if (clientsAll[i] != undefined) {
            if (clientsAll[i].length > 1) {
                isFalse = false;
                filteredClients = clientsAll[i].filter(el => {
                    if (el == "") {
                        isFalse = true;
                        return false;
                    }
                    return true;
                });
                if (filteredClients != undefined && filteredClients != '' && filteredClients != null) {
                    if (!isFalse) {
                        filteredclientsAll.push(filteredClients);
                    }
                }
            }
        }
    }
    return filteredclientsAll;
}

function saveClientsToDB(clients) {
    $.ajax({
        url: '/addclients',
        method: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        async: false,
        data: JSON.stringify(clients),
        success: function data() {},
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(jqXhr.responseText)
        }
    });
};

function saveHourReadingsToDB(readings) {
    $.ajax({
        url: '/api/addHourReadings',
        method: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(readings),
        success: function (data) {},
        error: function (jqXhr, textStatus, errorThrown) {
            if (jqXhr.responseText === 'Данните вече съществуват / Грешка') {
                notification(jqXhr.responseText, 'error');
            } else {
                notification(jqXhr.responseText, 'success');
            }
        }
    });
    notification('Данните се обработват', 'loading');
};

function saveGraphPredictionsToDB(readings) {
    $.ajax({
        url: '/api/saveGraphHourReadings',
        method: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(readings),
        success: function (data) {},
        error: function (jqXhr, textStatus, errorThrown) {
            if (jqXhr.responseText === 'Данните вече съществуват / Грешка') {
                notification(jqXhr.responseText, 'error');
            } else {
                notification(jqXhr.responseText, 'success');
            }
        }
    });
    notification('Данните се обработват', 'loading');
};

function saveESOGraphPredictions(readings) {
    $.ajax({
        url: '/api/saveESOGraphPredictions',
        method: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(readings),
        success: function (data) {},
        error: function (jqXhr, textStatus, errorThrown) {
            if (jqXhr.responseText === 'Данните вече съществуват / Грешка') {
                notification(jqXhr.responseText, 'error');
            } else {
                notification(jqXhr.responseText, 'success');
            }
        }
    });
    notification('Данните се обработват', 'loading');
};

function validateDocumentForCEZFunc(colSize, nameOfFirstCell) {
    if (colSize < 50) {
        if (nameOfFirstCell.includes('Ел Екс Корпорейшън АД')) {
            notification(`Избрана е опция за CEZ, а е подаден документ за EVN`, 'error');
            throw new Error(`Избрана е опция за CEZ, а е подаден документ за EVN`);
        } else {
            notification(`Избрана е опция за CEZ, а е подаден документ за EnergoPRO`, 'error');
            throw new Error(`Избрана е опция за CEZ, а е подаден документ за EnergoPRO`);
        }
    }
}

function validateDocumentForEVN_EnergoPROFunc(clientID, clientName, colSize) {
    if (clientID !== undefined) {
        if (clientID.includes('Уникален номер')) {
            notification(`Избрана е опция за ${company.getCompany()}, а е подаден документ за EnergoPRO`, 'error');
            throw new Error(`Избрана е опция за ${company.getCompany()}, а е подаден документ за EnergoPRO`);
        }
    }
    if (clientName.includes('Ел Екс Корпорейшън АД')) {
        notification(`Избрана е опция за ${company.getCompany()}, а е подаден документ за EVN`, 'error');
        throw new Error(`Избрана е опция за ${company.getCompany()}, а е подаден документ за EVN`);
    }
    if (colSize > 50) {
        notification(`Избрана е опция за ${company.getCompany()}, а е подаден документ за CEZ`, 'error');
        throw new Error(`Избрана е опция за ${company.getCompany()}, а е подаден документ за CEZ`);
    }
}

function validateDocumentForGraphFunc(fifthCell) {
    if (graphPrediction.getCompany() == '') {
        notification('Избери компания', 'error');
        throw new Error('Избери компания');
    }
    let dateSplittedDot, dotDate;
    try {
        dateSplittedDot = fifthCell.split(' ')[0].split('.');
        dotDate = new Date(`${dateSplittedDot[2]}-${dateSplittedDot[1]}-${dateSplittedDot[1]}`);
    } catch (err) {};
    if (dotDate != 'Invalid Date') {
        const errMsg = `Избрана е опция за График, а е получено мерене!`;
        notification(errMsg, 'error');
        throw new Error(errMsg);
    }
}

function handleEventListeners(dataImportType) {
    if (dataImportType == importTypes.hour_reading.CEZ) {
        removeGraphEventListeners();
        removeHourReadingsEVN_EnergoPROEventListeners();
        addHourReadingsCEZEventListeners();
    } else if (dataImportType == importTypes.hour_reading.EVN_EnergoPRO) {
        removeGraphEventListeners();
        removeHourReadingsCEZEventListeners();
        addHourReadningsEVN_EnergoPROEventListeners();
    } else if (dataImportType == importTypes.graph) {
        removeHourReadingsCEZEventListeners();
        removeHourReadingsEVN_EnergoPROEventListeners();
        addGraphEventListeners();
    }
}

function addHourReadingsCEZEventListeners() {
    document.getElementById('hourly-import').addEventListener('drop', processHourReadingCEZ, false);
    document.getElementById('upload-excel').addEventListener('change', processHourReadingCEZ, false);
}

function removeHourReadingsCEZEventListeners() {
    document.getElementById('hourly-import').removeEventListener('drop', processHourReadingCEZ, false);
    document.getElementById('upload-excel').removeEventListener('change', processHourReadingCEZ, false);
}

function addHourReadningsEVN_EnergoPROEventListeners() {
    document.getElementById('hourly-import').addEventListener('drop', processHourReadingEVN_EnergoPRO, false);
    document.getElementById('upload-excel').addEventListener('change', processHourReadingEVN_EnergoPRO, false);
}

function removeHourReadingsEVN_EnergoPROEventListeners() {
    document.getElementById('hourly-import').removeEventListener('drop', processHourReadingEVN_EnergoPRO, false);
    document.getElementById('upload-excel').removeEventListener('change', processHourReadingEVN_EnergoPRO, false);
}

function addGraphEventListeners() {
    document.getElementById('hourly-import').addEventListener('drop', processGraphFile, false);
    document.getElementById('upload-excel').addEventListener('change', processGraphFile, false);
}

function removeGraphEventListeners() {
    document.getElementById('hourly-import').removeEventListener('drop', processGraphFile, false);
    document.getElementById('upload-excel').removeEventListener('change', processGraphFile, false);
}
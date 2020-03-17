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

($('body > div.container').click(() => {
    if ($('#energo-pro').is(':checked')) {
        if ($('#hour-reading').is(':checked')) {
            addDropEventListener(importTypes.hour_reading.EVN_EnergoPRO);
        } else if ($('#graph').is(':checked')) {
            addDropEventListener(importTypes.graph);
        }
        company.setCompany('ENERGO_PRO').setErpType(3);
        graphPrediction.setCompany('ENERGO_PRO').setType(3);
    } else if ($('#evn').is(':checked')) {
        if ($('#hour-reading').is(':checked')) {
            addDropEventListener(importTypes.hour_reading.EVN_EnergoPRO);
        } else if ($('#graph').is(':checked')) {
            addDropEventListener(importTypes.graph);
        }
        company.setCompany('EVN').setErpType(1);
        graphPrediction.setCompany('EVN').setType(1);
    } else if ($('#cez').is(':checked')) {
        if ($('#hour-reading').is(':checked')) {
            addDropEventListener(importTypes.hour_reading.CEZ);
        } else if ($('#graph').is(':checked')) {
            addDropEventListener(importTypes.graph);
            graphPrediction.setCompany('CEZ').setType(2);
        }
    }
}));

function processHourReadingCEZ(e) {
    const operator = 2;
    const meteringType = 1; // Hour-Reading
    const profileID = 0;
    const isManufacturer = 0;

    e.stopPropagation();
    e.preventDefault();
    var files = e.dataTransfer.files,
        f = files[0];
    var reader = new FileReader();
    var fileName = e.dataTransfer.files[0].name;
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
            validateDocumentForCEZFunc(colSize, nameOfFirstCell);

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
                        currHourObj = {
                            currHour: val,
                            currValue: arr[i][x]
                        }
                        currHourValues.push(currHourObj);
                        x += 1;
                    }
                    let formattedDate = `${currDate.getFullYear()}-${currDate.getMonth()+1}-${currDate.getDate()}`;
                    if (!formattedDate.includes('NaN')) {
                        let clientName = arr[i][0];
                        let clientID = arr[i][1];
                        let typeEnergy = arr[i][2];
                        typeEnergy === "Активна енергия - Del" ? typeEnergy = 0 : typeEnergy = 1;
                        currHourReading.push(clientName, clientID, typeEnergy, formattedDate, currHourValues, new Date());
                        client.push(0, clientName, clientID, meteringType, profileID, operator, isManufacturer, new Date());
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
            console.log(allHourReadings);
            saveClientsToDB(allClients);
            cl = getClientsFromDB(convertClientIDsToString(clientsIDs));
            console.log(cl);
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
    e.stopPropagation();
    e.preventDefault();
    var files = e.dataTransfer.files,
        f = '';
    let allHourReadings = [];
    let clientIDs = [];
    let clientsALL = [];
    for (let z = 0; z < files.length; z += 1) {
        f = files[z];
        var reader = new FileReader();
        var fileName = e.dataTransfer.files[z].name;
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
                            currHourActiveEnergyObj = {
                                currHour: val,
                                currValue: arr[1][x]
                            }
                            currReactiveEnergyObj = {
                                currHour: val,
                                currValue: arr[2][x] == '' || arr[2][x] == undefined ? 0 : arr[2][x]
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
                    client.push(0, clientName, clientID, meteringType, profileID, operator, isManufacturer, new Date());
                    clientsALL.push(client);
                    // Last Iteration of files []
                    if (z + 1 === files.length) {
                        saveClientsToDB(clientsALL);
                        let cl;
                        cl = getClientsFromDB(convertClientIDsToString(clientIDs));
                        changeClientIdForHourReadings(allHourReadings, cl);
                        saveHourReadingsToDB(allHourReadings);
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

    const files = e.dataTransfer.files,
        f = files[0];
    var reader = new FileReader();
    var fileName = e.dataTransfer.files[0].name;
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
            //    console.log(getCols(workbook['Sheets'][`${first_sheet_name}`]));

            let client = [];
            let clientsAll = [];
            let clientID;
            let allGraphHourReadings = [];
            let graph_hour_reading = [];
            let currHourValues = [];
            let type = 1;
            let ERP = graphPrediction.getType();
            let arr = getCols(workbook['Sheets'][`${first_sheet_name}`]);

            validateDocumentForGraphFunc();
            for (let i = 1; i < arr.length; i += 1) {
                let clientName = arr[i][0];
                let clientIdentCode = arr[i][1];
                if (clientIdentCode != null && clientIdentCode != undefined && clientName!= null && clientName != undefined) {
                    client.push(0, clientName, clientIdentCode, meteringType, profileID, graphPrediction.getType(), isManufacturer, new Date());
                    clientsAll.push(client);
                    client = [];
                }
            }
            saveClientsToDB(clientsAll);
            let date = new Date(documentDate);
            for (let i = 1; i < arr.length; i += 1) {
                const clientName = arr[i][0];
                let ident_code = arr[i][1];
                if (clientName == '' || clientName == undefined || clientName == null ||
                    ident_code == '' || ident_code == undefined || ident_code == null) {
                    continue;
                } else {
                    for (let y = 2; y < arr[i].length; y += 1) {
                        let currHourHelper = arr[0][y].split(":");
                        let currHour = currHourHelper[0] - 1;
                        if (currHour == -1) {
                            currHour = 23;
                        }
                        let currValue = arr[i][y];
                        let currHourObj = {
                            currHour,
                            currValue
                        }
                        currHourValues.push(currHourObj);
                    }
                    if (ident_code != '' && ident_code != undefined && ident_code != null) {
                        clientID = getClientIDFromDB(ident_code);
                        let createdDate = new Date();
                        graph_hour_reading.push(clientID, date, currHourValues, type, ERP, createdDate);
                        allGraphHourReadings.push(graph_hour_reading);
                        graph_hour_reading = [];
                        currHourValues = [];
                    }
                }
            }
            saveGraphHourReadingsToDB(allGraphHourReadings);
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

function getClientIDFromDB(client) {
    notification('Loading..', 'loading');
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
            console.log('error');
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
    notification('Loading..', 'loading');
    $.ajax({
        url: '/addclients',
        method: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        async: false,
        data: JSON.stringify(clients),
        success: function data() {
            console.log('Clients saved');
        },
        error: function (jqXhr, textStatus, errorThrown) {
            //  notification(errorThrown, 'error');
            console.log('error in save clients');
        }
    });
};

function getClientsFromDB(clients) {
    notification('Loading..', 'loading');
    let retVal;
    $.ajax({
        url: '/api/getClients',
        method: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        async: false,
        data: JSON.stringify(clients),
        success: function (data) {
            console.log('Got clients');
            retVal = data;
        },
        error: function (jqXhr, textStatus, errorThrown) {
            notification(errorThrown, 'error');
            console.log('error');
        }
    });
    return retVal;
};

function saveHourReadingsToDB(readings) {
    $.ajax({
        url: '/api/addHourReadings',
        method: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(readings),
        success: function (data) {
            console.log('Readings saved');
        },
        error: function (jqXhr, textStatus, errorThrown) {
            //   notification(errorThrown, 'error');
            console.log('error in save readings');
        }
    });
    notification('Everything is good', 'success');
};

function saveGraphHourReadingsToDB(readings) {
    $.ajax({
        url: '/api/saveGraphHourReadings',
        method: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(readings),
        success: function (data) {
            console.log('Readings saved');
        },
        error: function (jqXhr, textStatus, errorThrown) {
            //   notification(errorThrown, 'error');
            console.log('error in save readings');
        }
    });
    notification('Everything is good', 'success');
};

function notification(msg, type) {
    toastr.clear();
    toastr.options = {
        "closeButton": false,
        "debug": false,
        "newestOnTop": false,
        "progressBar": false,
        "positionClass": "toast-top-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }
    if (type == 'error') {
        toastr.error(msg);
    } else if (type == 'success') {
        toastr.success(msg);
    } else if (type == 'loading') {
        toastr.info(msg);
    }
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

function validateDocumentForGraphFunc() {
    if (graphPrediction.getCompany() == '') {
        notification('Избери компания', 'error');
        throw new Error('Избери компания');
    }
}

function addDropEventListener(dataImportType) {
    if (dataImportType == importTypes.hour_reading.CEZ) {
        document.getElementById('hourly-import').addEventListener('drop', processHourReadingCEZ, false);
    } else if (dataImportType == importTypes.hour_reading.EVN_EnergoPRO) {
        document.getElementById('hourly-import').addEventListener('drop', processHourReadingEVN_EnergoPRO, false);
    } else if (dataImportType == importTypes.graph) {
        document.getElementById('hourly-import').addEventListener('drop', processGraphFile, false);
    }
}
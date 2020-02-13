;
$(document).ready(function () {
    getDataListing();
    visualizeHistoryParams();
    listAllReadings();
});

function getAllListings(data) {
    let i = 0;
    for (let el in data) {

        let currRow = $('<tr>').attr('role', 'row');
        if (i % 2 == 1) {
            currRow.addClass('even');
        } else {
            currRow.addClass('odd');
        }
        i += 1;
        currRow
            .append('<td>' + data[el]['invoicing_id'] + '</td>')
            .append($('<td>' + data[el]['client_number'] + '</td>'))
            .append($(`<td><a href=clients/${data[el]['id']}>${data[el]['ident_code']}</a></td>`))
            .append($('<td>' + data[el]['client_name'] + '</td>'))
            .append($('<td>' + getJsDate(data[el]['period_from']) + '</td>'))
            .append($('<td>' + getJsDate(data[el]['period_to']) + '</td>'))
            .append($('<td>' + (data[el]['time_zone'] == '' ? '' : data[el]['time_zone']) + '</td>'))
            .append($('<td>' + (data[el]['value_bgn'] == 0 ? 'няма стойност' : `${data[el]['value_bgn']} лв`) + '</td>'))
            .append($('<td>' + (data[el]['type'] == 1 ? 'Техническа част' : 'Разпределение') + '</td>'))
            .append($('<td>' + (data[el]['operator'] == 2 ? 'ЧЕЗ' : data[el]['operator'] == 1 ? 'EVN' : 'EnergoPRO') + '</td>'))
            .append($(`<td><a href="reading/${data[el]['invoicing_id']}"><button type="button" class="btn btn-success" data-id="${data[el]['invoicing_id']}">Детайли на мерене</button></a></td>`))
            .append($('</tr>'));
        currRow.appendTo($('#tBody'));
    }
    // Order DESC
    dataTable = $('#list-readings').DataTable({
        "order": [
            [0, "desc"]
        ],
        retrieve: true
    });
    $('#tBody').addClass('text-center');
    $('#list-readings > thead').addClass('text-center');

}

function visualizeDataTable(data) {
    getAllListings(data);
}

function getDataListing() {
    $.ajax({
        url: '/getInvoicingClientIDs&Names',
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            console.log(data);
            convertDataToSet(data);
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
}

function convertDataToSet(data) {
    let clientNames = [];
    let clientIdentCodes = [];
    for (let num in data) {
        clientNames.push(data[num].client_name);
        clientIdentCodes.push(data[num].ident_code);
    }
    let uniqueClientNames = removeDuplicatesFromArr(clientNames);

    visualizeDataListings([uniqueClientNames, clientIdentCodes]);
}

function visualizeDataListings(arr) {
    let clientNames = arr[0];
    let clientIdentCodes = arr[1];

    for (let name of clientNames) {
        $('#names').append(`<option value="${name}"></option>`);
    }

    for (let identCode of clientIdentCodes) {
        $('#idList').append(`<option value="${identCode}"></option>`);
    }
}

$('body > div > form > div > button').on('click', (event) => {
    event.preventDefault();
    dataTable.clear().destroy();
    dataTable;
    let fromDate = $('#fromDate').val();
    let toDate = $('#toDate').val();
    let nameOfClient = $('#nameOfClient').val();
    let clientID = $('#clientID').val();
    let ERP = $('#ERP').val();

    listAllReadings([fromDate, toDate, nameOfClient, clientID, ERP]);
});

function listAllReadings(arr) {
    if (!arr) {
        var fromDate = findGetParameter('fromDate');
        var toDate = findGetParameter('toDate');
        var nameOfClient = findGetParameter('clientNames');
        var clientID = findGetParameter('clientID');
        var ERP = [];
        if (window.location.href.includes('cez')) {
            ERP.push(2);
        }
        if (window.location.href.includes('energoPRO')) {
            ERP.push(3);
        }
        if (window.location.href.includes('evn')) {
            ERP.push(1);
        }

    } else {
        var [
            fromDate,
            toDate,
            nameOfClient,
            clientID,
            ERP
        ] = arr;
    }
    if (fromDate === null && toDate === null) {
        let dates = getThisAndLastMonthDates();
        fromDate = dates[1];
        toDate = dates[0];
    }
    notification('Loading...', 'loading');
    $.ajax({
        url: `/api/filterData`,
        method: 'POST',
        data: {
            date_from: fromDate,
            to_date: toDate,
            name: nameOfClient,
            ERP,
            id: clientID
        },
        dataType: 'json',
        success: function (data) {
            visualizeDataTable(data);
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
    toastr.clear();
};

function findGetParameter(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function getJsDate(isoFormatDateString) {
    let dateParts = isoFormatDateString.split("-");
    let days = Number(dateParts[2].substr(0, 2)) + 1
    let months = dateParts[1];
    if (days == 32) {
        dateParts[1] += 1;
        days -= 31;
        months = Number(months) + 1;
    };
    let jsDate = `${dateParts[0]}-${months}-${days}`;

    return jsDate;
}

function getThisAndLastMonthDates() {
    let today = new Date();
    let thisMonthDate = `${today.getFullYear()}-${Number(today.getMonth())+1}-${today.getDay()}`;
    let lastMonthDate = `${today.getFullYear()}-${Number(today.getMonth())}-${today.getDay()}`;
    if (Number(today.getMonth()) - 1 === -1) {
        lastMonthDate = `${Number(today.getFullYear())-1}-${Number(today.getMonth())+12}-${today.getDay()}`;
    }
    return [thisMonthDate, lastMonthDate];
}

function removeDuplicatesFromArr(arr) {
    let uniqueNames = [];
    $.each(arr, function (i, el) {
        if ($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
    });
    return uniqueNames;
}

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

function visualizeHistoryParams() {
    findGetParameter('toDate') === null ? '' : $('#toDate').val(findGetParameter('toDate'));
    findGetParameter('fromDate') === null ? '' : $('#fromDate').val(findGetParameter('fromDate'));
    findGetParameter('clientNames') === null ? '' : $('#nameOfClient').val(findGetParameter('clientNames'));
    findGetParameter('clientID') === null ? '' : $('#clientID').val(findGetParameter('clientID'));

    if (!window.location.href.includes('cez')) {
        $('#cez').prop('checked', false);
    }
    if (!window.location.href.includes('energoPRO')) {
        $('#energoPRO').prop('checked', false);
    }
    if (!window.location.href.includes('evn')) {
        $('#evn').prop('checked', false);
    }
}
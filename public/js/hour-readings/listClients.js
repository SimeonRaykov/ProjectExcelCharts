$(document).ready(function () {
    $.ajax({
        url: `http://localhost:3000/api/getAllClients`,
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            callback(data);
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });

});

function callback(data) {
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
            .append($('<td>' + data[el]['id'] + '</td>'))
            .append($(`<td><a href=clients/hour-reading/${data[el]['id']}>${data[el]['ident_code']}</a></td>`))
            .append($('<td>' + data[el]['client_name'] + '</td>'))
            .append($('</tr>'));
        currRow.appendTo($('#tBody'));
    }
    $('#tBody').addClass('text-center');
    $('#clients > thead').addClass('text-center');
    //DESC order 
    $('#clients').DataTable({
        "order": [
            [0, "asc"]
        ]
    });
};

/*function callback(data) {
    let clientsContainer = $('.container .clients');
    for (let el in data) {
        let id = data[el]['id'];
        let ident_code = data[el]['ident_code'];
        let name = data[el]['client_name'];
        let currElement = $(`<td><a href=clients/hour-reading/${id}>${ident_code}</a></td>`)
        // clientsContainer.append(currElement);
    }
} */
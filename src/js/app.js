import $ from 'jquery';
import {parseCode, getParseData, dataForTable} from './code-analyzer';
let table;
$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));

        getParseData(parsedCode);
        clearTable();
        insertToTable();
    });
});

function insertToTable() {
    table = document.getElementById('myTable');
    if (dataForTable != []) {
        for (let i = 0; i < dataForTable.length; i++) {
            let row = table.insertRow(i + 1);
            let line = row.insertCell(0);
            let type = row.insertCell(1);
            let name = row.insertCell(2);
            let condition = row.insertCell(3);
            let value = row.insertCell(4);
            line.innerHTML = dataForTable[i].line;
            type.innerHTML = dataForTable[i].type;
            name.innerHTML = dataForTable[i].name;
            condition.innerHTML = (dataForTable[i].condition.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
            value.innerHTML = dataForTable[i].value;
        }
    }
}

function clearTable(){
    if(table) {
        var rowCount = table.rows.length;
        for (var x=rowCount-1; x>0; x--) {
            table.deleteRow(x);
        }
    }
}

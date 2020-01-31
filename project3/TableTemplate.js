// import "./cs142-template-processor";
'use strict';

class TableTemplate {
    static fillIn(id, dict, columnName) { //columnName is a string
        let table = document.getElementById(id);
        table.style = `visibility: visible`;
        let tbody = table.tBodies[0];
        let firstRow = tbody.rows[0];
        let headerHtml = firstRow.innerHTML;
        let template = new Cs142TemplateProcessor(headerHtml);
        firstRow.innerHTML = template.fillIn(dict);
        let headerCells = firstRow.cells;
        let col = -1;
        for (let i = 0; i < headerCells.length; i++) {
            let td = headerCells[i];
            if (td.innerHTML === columnName) {
                col = i;
            }
        }
        for (let row of tbody.rows) {
            let cells = row.cells;
            for (let i = 0; i < cells.length; i++) {
                if (columnName === undefined || i === col) {
                    let cellTemplate = new Cs142TemplateProcessor(cells[i].innerHTML);
                    cells[i].innerHTML = cellTemplate.fillIn(dict);
                }
            }
        }
    }
}
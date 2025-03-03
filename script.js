const display = document.getElementById('display');
const errorDiv = document.getElementById('error-message');
const container = document.getElementById('table-container');

function insertAtCursor(value) {
    const start = display.selectionStart;
    const end = display.selectionEnd;
    const current = display.value;
    
    display.value = current.substring(0, start) + value + current.substring(end);
    display.selectionStart = display.selectionEnd = start + value.length;
    display.focus();
}

function handleButtonClick(value) {
    insertAtCursor(value);
}

function handleKeydown(e) {
    if (e.key === 'Enter') {
        calculate();
        e.preventDefault();
    } else if (e.key === 'Escape') {
        clearDisplay();
    } 
}

function calculate() {
    errorDiv.textContent = '';
    container.innerHTML = '';

    try {
        const { variables, truthTable } = generateTruthTable(display.value);
        
        const table = document.createElement('table');
        
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        variables.forEach(v => {
            const th = document.createElement('th');
            th.textContent = v;
            headerRow.appendChild(th);
        });
        
        const resultTh = document.createElement('th');
        resultTh.textContent = 'RESULT';
        headerRow.appendChild(resultTh);
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        truthTable.forEach(row => {
            const tr = document.createElement('tr');
            
            variables.forEach(v => {
                const td = document.createElement('td');
                td.textContent = row[v] ? '1' : '0';
                tr.appendChild(td);
            });

            const resultTd = document.createElement('td');
            resultTd.textContent = row.RESULT ? '1' : '0';
            resultTd.style.fontWeight = 'bold';
            resultTd.style.backgroundColor = '#e9f5ff';
            tr.appendChild(resultTd);
            
            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        container.appendChild(table);

    } catch (error) {
        errorDiv.textContent = `错误: ${error.message}`;
    }
    display.selectionStart = display.value.length
}

function clearDisplay() {
    display.value = '';
    errorDiv.textContent = '';
    container.innerHTML = '';
}

display.addEventListener('keydown', handleKeydown);
document.querySelectorAll('.button').forEach(button => {
    const value = button.textContent;
    if (value !== '=' && value !== 'C') {
        button.onclick = () => handleButtonClick(value);
    }
});

document.getElementById('show').addEventListener('click', ()=>{
    document.getElementById('keytable').style = "";
})

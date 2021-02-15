const viewPage = document.getElementById('view-page');

const viewPageTitle = [document.getElementById('test-title'), document.getElementById('test-title2')];
const viewPageDescription = document.getElementById('test-description');
const viewPageCreatedDate = document.getElementById('test-created-date');
const viewPageModificationDate = document.getElementById('test-modification-date');
const viewPageColumnsList = document.getElementById('test-columns');
const viewPageDataTableHeader = document.getElementById('view-test-data-header');
const viewPageDataTableBody = document.getElementById('view-test-data-body');

const columnTemplate = document.getElementById('column-child-template');
const dataTemplate = document.getElementById('data-child-template');

function loadViewPage() {
    currentPage = viewPage;
    for (var i = 0; i < viewPageTitle.length; i++) {
        viewPageTitle[i].textContent = currentTest.title;
    }
    viewPageDescription.textContent = currentTest.description;
    viewPageCreatedDate.textContent = DATE_FORMATER.format(currentTest.createdDate);
    viewPageModificationDate.textContent = DATE_FORMATER.format(currentTest.modificationDate);
    currentPage.classList.remove('hide');

    removeAllChildren(viewPageColumnsList);
    removeAllChildren(viewPageDataTableHeader);
    removeAllChildren(viewPageDataTableBody);
    var e;
    var row = dataTemplate.content.cloneNode(true);
    row.querySelector('.min').innerHTML = '<x-i18n key="view"></x-i18n>';
    for (var i = 0; i < currentTest.columns.length; i++) {
        e = columnTemplate.content.cloneNode(true);
        e.querySelector('.test-column-text').textContent = currentTest.columns[i].name;
        viewPageColumnsList.appendChild(e);

        e = document.createElement('td');
        e.textContent = currentTest.columns[i].name;
        row.children[0].appendChild(e);
    }
    viewPageDataTableHeader.appendChild(row);

    for (var i = 0; i < currentTest.data.length; i++) {
        row = dataTemplate.content.cloneNode(true);
        for (var j = 0; j < currentTest.data[i].length; j++) {
            e = document.createElement('td');
            e.textContent = currentTest.columns[j].getDataValueString(currentTest.data[i][j]);
            row.children[0].appendChild(e);
        }
        viewPageDataTableBody.appendChild(row);
    }

    setPageTitle(currentTest.title);
}
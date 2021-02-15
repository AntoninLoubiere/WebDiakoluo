const viewPage = document.getElementById('view-page');

const viewPageTitle = [document.getElementById('test-title'), document.getElementById('test-title2')];
const viewPageDescription = document.getElementById('test-description');
const viewPageCreatedDate = document.getElementById('test-created-date');
const viewPageModificationDate = document.getElementById('test-modification-date');
const viewPageColumnsList = document.getElementById('test-columns');
const viewPageDataTableHeader = document.getElementById('view-test-data-header');
const viewPageDataTableBody = document.getElementById('view-test-data-body');

const viewColumnModalTitle1 = document.getElementById('modal-view-column-title1');
const viewColumnModalTitle2 = document.getElementById('modal-view-column-title2');
const viewColumnModalDescription = document.getElementById('modal-view-column-description');

const viewDataModalContent = document.getElementById('test-data-view-content');
const viewDataModalId = document.getElementById('test-view-data-id');

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
    for (let i = 0; i < currentTest.columns.length; i++) {
        e = columnTemplate.content.cloneNode(true);
        e.querySelector('.test-column-text').textContent = currentTest.columns[i].name;
        e.children[0].onclick = function() {
            columnClickCallback(i);
        };

        viewPageColumnsList.appendChild(e);

        e = document.createElement('td');
        e.textContent = currentTest.columns[i].name;
        row.children[0].appendChild(e);
    }
    viewPageDataTableHeader.appendChild(row);

    for (let i = 0; i < currentTest.data.length; i++) {
        row = dataTemplate.content.cloneNode(true);
        for (var j = 0; j < currentTest.data[i].length; j++) {
            e = document.createElement('td');
            e.textContent = currentTest.columns[j].getDataValueString(currentTest.data[i][j]);
            row.children[0].appendChild(e);
        }
        row.children[0].onclick = function() {
            dataClickCallback(i);
        }
        viewPageDataTableBody.appendChild(row);
    }

    setPageTitle(currentTest.title);
    updateViewPage();
}

function updateColumnModal(id) {
    if (currentModal != "test-column-view") {
        currentModal = "test-column-view";
        showModal(currentModal);
        currentState.id = -1;
    }
    if (currentState.id != id) {
        var column = currentTest.columns[id];
        viewColumnModalTitle1.textContent = column.name;
        viewColumnModalTitle2.textContent = column.name;
        viewColumnModalDescription.textContent = column.description;
    }
}

function updateDataModal(id) {
    if (currentModal != "test-data-view") {
        currentModal = "test-data-view";
        showModal(currentModal);
        currentState.id = -1;
    }
    if (currentState.id != id) {
        var row = currentTest.data[id];
        viewDataModalId.textContent = id + 1;
        removeAllChildren(viewDataModalContent);
        var e;
        var column;
        for (var i = 0; i < row.length; i++) {
            column = currentTest.columns[i];
            e = document.createElement('h3');
            e.textContent = column.name + ":";
            e.classList = ['no-margin']
            viewDataModalContent.appendChild(e);

            e = document.createElement('div');
            e.textContent = column.getDataValueString(row[i]);
            viewDataModalContent.appendChild(e);
        }
    }
}

function updateViewPage() {
    var p = Number(currentURL.searchParams.get('column'));
    if (p) {
        updateColumnModal(p - 1);
        return;
    }

    p = Number(currentURL.searchParams.get('data'));
    if (p) {
        updateDataModal(p - 1);
        return;
    }

    if (currentModal) {
        hideModal(currentModal);
        currentModal = null;
    }
}

function columnClickCallback(id) {
    updateColumnModal(id);
    currentURL.searchParams.set('column', id + 1);
    history.pushState({}, '', currentURL);
}

function dataClickCallback(id) {
    updateDataModal(id);
    currentURL.searchParams.set('data', id + 1);
    history.pushState({}, '', currentURL);
}

function closeViewColumnModal() {
    currentURL.searchParams.delete('column');
    history.pushState({}, '', currentURL);
    hideModal(currentModal);
    currentModal = null;
}

function closeViewDataModal() {
    currentURL.searchParams.delete('data');
    history.pushState({}, '', currentURL);
    hideModal(currentModal);
    currentModal = null;
}
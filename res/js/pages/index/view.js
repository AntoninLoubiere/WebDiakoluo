const viewPageView = document.getElementById('view-page');

const viewPageTitle = [document.getElementById('view-test-title'), document.getElementById('view-test-title2')];
const viewPageDescription = document.getElementById('view-test-description');
const viewPageCreatedDate = document.getElementById('view-test-created-date');
const viewPageModificationDate = document.getElementById('view-test-modification-date');
const viewPageColumnsList = document.getElementById('view-test-columns');
const viewPageDataTableHeader = document.getElementById('view-test-data-header');
const viewPageDataTableBody = document.getElementById('view-test-data-body');

const viewColumnModalTitle1 = document.getElementById('modal-view-column-title1');
const viewColumnModalTitle2 = document.getElementById('modal-view-column-title2');
const viewColumnModalDescription = document.getElementById('modal-view-column-description');

const viewDataModalContent = document.getElementById('view-test-data-content');
const viewDataModalId = document.getElementById('view-test-data-id');

const viewColumnTemplate = document.getElementById('view-column-child-template');
const viewDataTemplate = document.getElementById('view-data-child-template');

PAGES.view = new Page(viewPageView, "view", true, loadViewPage, updateViewPage, null);
PAGES.view.onkeydown = onkeydownViewPage;

function loadViewPage() {
    for (var i = 0; i < viewPageTitle.length; i++) {
        viewPageTitle[i].textContent = currentTest.title;
    }
    viewPageDescription.textContent = currentTest.description;
    viewPageCreatedDate.textContent = DATE_FORMATER.format(currentTest.createDate);
    viewPageModificationDate.textContent = DATE_FORMATER.format(currentTest.lastModificationDate);
    viewPageView.classList.remove('hide');

    removeAllChildren(viewPageColumnsList);
    removeAllChildren(viewPageDataTableHeader);
    removeAllChildren(viewPageDataTableBody);
    var e;
    var row = viewDataTemplate.content.cloneNode(true);
    row.querySelector('.min').innerHTML = '<x-i18n key="view"></x-i18n>';
    for (let i = 0; i < currentTest.columns.length; i++) {
        e = viewColumnTemplate.content.cloneNode(true);
        e.querySelector('.test-column-text').textContent = currentTest.columns[i].name;
        e.children[0].onclick = function() {
            viewColumnClickCallback(i);
        };

        viewPageColumnsList.appendChild(e);

        e = document.createElement('td');
        e.textContent = currentTest.columns[i].name;
        row.children[0].appendChild(e);
    }
    viewPageDataTableHeader.appendChild(row);

    for (let i = 0; i < currentTest.data.length; i++) {
        row = viewDataTemplate.content.cloneNode(true);
        for (var j = 0; j < currentTest.data[i].length; j++) {
            e = document.createElement('td');
            e.textContent = currentTest.columns[j].getDataValueString(currentTest.data[i][j]);
            row.children[0].appendChild(e);
        }
        row.children[0].onclick = function() {
            viewDataClickCallback(i);
        }
        viewPageDataTableBody.appendChild(row);
    }

    setPageTitle(currentTest.title);
    updateViewPage();
}

function updateViewPage() {
    var p = Number(currentURL.searchParams.get('column'));
    if (p) {
        if (p > currentTest.columns.length) p = currentTest.data.length;
        if (p <= 0) p = 1;
        updateViewColumnModal(p - 1);
        return;
    }

    p = Number(currentURL.searchParams.get('data'));
    if (p) {
        if (p > currentTest.data.length) p = currentTest.data.length;
        if (p <= 0) p = 1;
        updateViewDataModal(p - 1);
        return;
    }

    if (currentModal) {
        hideModal(currentModal);
        currentModal = null;
    }
}

function onkeydownViewPage(event) {
    switch (event.keyCode) {
        case KeyboardEvent.DOM_VK_ESCAPE:
            if (currentModal == 'view-test-column') {
                closeViewColumnModal();
            } else if (currentModal == 'view-test-data') {
                closeViewDataModal();
            } else {
                backToMain();
            }
            event.preventDefault();
            break;

        case KeyboardEvent.DOM_VK_RIGHT:
            if (currentModal == 'view-test-column') {
                nextViewColumn();
                event.preventDefault();
            } else if (currentModal == 'view-test-data') {
                nextViewData();
                event.preventDefault();
            }
            break;

        case KeyboardEvent.DOM_VK_LEFT:
            if (currentModal == 'view-test-column') {
                previousViewColumn();
                event.preventDefault();
            } else if (currentModal == 'view-test-data') {
                previousViewData();
                event.preventDefault();
            }
            break;

        case KeyboardEvent.DOM_VK_PAGE_DOWN:
            if (currentModal == 'view-test-column') {
                lastViewColumn();
                event.preventDefault();
            } else if (currentModal == 'view-test-data') {
                lastViewData();
                event.preventDefault();
            }
            break;

        case KeyboardEvent.DOM_VK_PAGE_UP:
            if (currentModal == 'view-test-column') {
                firstViewColumn();
                event.preventDefault();
            } else if (currentModal == 'view-test-data') {
                firstViewData();
                event.preventDefault();
            }
            break;
    }
}

function updateViewColumnModal(id) {
    if (currentModal != "view-test-column") {
        currentModal = "view-test-column";
        showModal(currentModal);
        currentState.id = -1;
    }
    if (currentState.id != id) {
        currentState.id = id;
        
        var column = currentTest.columns[id];
        viewColumnModalTitle1.textContent = column.name;
        viewColumnModalTitle2.textContent = column.name;
        viewColumnModalDescription.textContent = column.description;
    }
}

function updateViewDataModal(id) {
    if (currentModal != "view-test-data") {
        currentModal = "view-test-data";
        showModal(currentModal);
        currentState.id = -1;
    }
    if (currentState.id != id) {
        currentState.id = id;

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

function viewColumnClickCallback(id) {
    updateViewColumnModal(id);
    currentURL.searchParams.set('column', id + 1);
    history.pushState({}, '', currentURL);
}

function nextViewColumn() {
    if (currentState.id < currentTest.columns.length - 1) {
        updateViewColumnModal(currentState.id + 1); // don't add to history in order to not spam the history 
    }
}

function previousViewColumn() {
    if (currentState.id > 0) {
        updateViewColumnModal(currentState.id - 1);
    }
}

function firstViewColumn() {
    updateViewColumnModal(0);
}

function lastViewColumn() {
    updateViewColumnModal(currentTest.columns.length - 1);
}

function viewDataClickCallback(id) {
    updateViewDataModal(id);
    currentURL.searchParams.set('data', id + 1);
    history.pushState({}, '', currentURL);
}

function nextViewData() {
    if (currentState.id < currentTest.data.length - 1) {
        updateViewDataModal(currentState.id + 1);
    }
}

function previousViewData() {
    if (currentState.id > 0) {
        updateViewDataModal(currentState.id - 1);
    }
}

function firstViewData() {
    updateViewDataModal(0);
}

function lastViewData() {
    updateViewDataModal(currentTest.data.length - 1);
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

function editTestViewPage() {
    currentURL.searchParams.set('page', 'edit');
    history.pushState({}, 'Edit test', currentURL);
    loadPage();
}
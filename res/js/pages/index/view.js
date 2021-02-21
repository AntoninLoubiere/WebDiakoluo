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

class ViewPage extends Page {
    constructor() {
        super(viewPageView, "view", true);
    }

    /* when the page is loaded */
    onload() {
        for (var i = 0; i < viewPageTitle.length; i++) {
            viewPageTitle[i].textContent = currentTest.title;
        }
        viewPageDescription.textContent = currentTest.description;
        viewPageCreatedDate.textContent = DATE_FORMATER.format(currentTest.createDate);
        viewPageModificationDate.textContent = DATE_FORMATER.format(currentTest.lastModificationDate);

        removeAllChildren(viewPageColumnsList);
        removeAllChildren(viewPageDataTableHeader);
        removeAllChildren(viewPageDataTableBody);
        var e;
        var row = viewDataTemplate.content.cloneNode(true);
        row.querySelector('.min').innerHTML = '<x-i18n key="view"></x-i18n>';
        for (let i = 0; i < currentTest.columns.length; i++) {
            e = viewColumnTemplate.content.cloneNode(true);
            e.querySelector('.test-column-text').textContent = currentTest.columns[i].name;
            e.children[0].onclick = () => {
                this.columnClickCallback(i);
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
            row.children[0].onclick = () => {
                this.dataClickCallback(i);
            }
            viewPageDataTableBody.appendChild(row);
        }

        setPageTitle(currentTest.title);
        viewPageView.classList.remove('hide');
        this.onupdate();
    }

    /* when the page is updated */
    onupdate() {
        var p = Number(currentURL.searchParams.get('column'));
        if (p) {
            if (p > currentTest.columns.length) p = currentTest.data.length;
            if (p <= 0) p = 1;
            this.updateColumnModal(p - 1);
            return;
        }

        p = Number(currentURL.searchParams.get('data'));
        if (p) {
            if (p > currentTest.data.length) p = currentTest.data.length;
            if (p <= 0) p = 1;
            this.updateDataModal(p - 1);
            return;
        }

        if (currentModal) {
            hideModal(currentModal);
            currentModal = null;
        }
    }

    /* when a key is press */
    onkeydown(event) {
        switch (event.keyCode) {
            case KeyboardEvent.DOM_VK_ESCAPE:
                if (currentModal == 'view-test-column') {
                    this.closeColumnModal();
                } else if (currentModal == 'view-test-data') {
                    this.closeDataModal();
                } else if (currentModal) {
                    hideModal(currentModal);
                } else {
                    backToMain(true);
                }
                event.preventDefault();
                break;

            case KeyboardEvent.DOM_VK_RIGHT:
                if (currentModal == 'view-test-column') {
                    this.nextColumn();
                    event.preventDefault();
                } else if (currentModal == 'view-test-data') {
                    this.nextData();
                    event.preventDefault();
                }
                break;

            case KeyboardEvent.DOM_VK_LEFT:
                if (currentModal == 'view-test-column') {
                    this.previousColumn();
                    event.preventDefault();
                } else if (currentModal == 'view-test-data') {
                    this.previousData();
                    event.preventDefault();
                }
                break;

            case KeyboardEvent.DOM_VK_PAGE_DOWN:
                if (currentModal == 'view-test-column') {
                    this.lastColumn();
                    event.preventDefault();
                } else if (currentModal == 'view-test-data') {
                    this.lastData();
                    event.preventDefault();
                }
                break;

            case KeyboardEvent.DOM_VK_PAGE_UP:
                if (currentModal == 'view-test-column') {
                    this.firstColumn();
                    event.preventDefault();
                } else if (currentModal == 'view-test-data') {
                    this.firstData();
                    event.preventDefault();
                }
                break;
        }
    }

    /* update the column modal */
    updateColumnModal(id) {
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

    /* update the data modal */
    updateDataModal(id) {
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

    /* when a column is clicked */
    columnClickCallback(id) {
        this.updateColumnModal(id);
        currentURL.searchParams.set('column', id + 1);
        history.pushState({}, '', currentURL);
    }

    /* go to the next column */
    nextColumn() {
        if (currentState.id < currentTest.columns.length - 1) {
            this.updateColumnModal(currentState.id + 1); // don't add to history in order to not spam the history 
        }
    }

    /* go to the previous column */
    previousColumn() {
        if (currentState.id > 0) {
            this.updateColumnModal(currentState.id - 1);
        }
    }

    /* go to the first column */
    firstColumn() {
        this.updateColumnModal(0);
    }

    /* go to the last column */
    lastColumn() {
        this.updateColumnModal(currentTest.columns.length - 1);
    }

    /* when a data is clicked */
    dataClickCallback(id) {
        this.updateDataModal(id);
        currentURL.searchParams.set('data', id + 1);
        history.pushState({}, '', currentURL);
    }

    /* go to the next data */
    nextData() {
        if (currentState.id < currentTest.data.length - 1) {
            this.updateDataModal(currentState.id + 1);
        }
    }

    /* go to the previous data */
    previousData() {
        if (currentState.id > 0) {
            this.updateDataModal(currentState.id - 1);
        }
    }

    /* go to the first data */
    firstData() {
        this.updateDataModal(0);
    }

    /* go to the last data */
    lastData() {
        this.updateDataModal(currentTest.data.length - 1);
    }

    /* close the column modal */
    closeColumnModal() {
        currentURL.searchParams.delete('column');
        history.pushState({}, '', currentURL);
        hideModal(currentModal);
        currentModal = null;
    }

    /* close the data modal */
    closeDataModal() {
        currentURL.searchParams.delete('data');
        history.pushState({}, '', currentURL);
        hideModal(currentModal);
        currentModal = null;
    }

    /* edit the test */
    editTest() {
        currentURL.searchParams.set('page', 'edit');
        history.pushState({}, 'Edit test', currentURL);
        loadPage();
    }

    /* delete the test */
    deleteTest() {
        showModal('test-delete-confirm');
        currentModal = 'test-delete-confirm';
        history.pushState({}, 'Modal');
    }

    /* callback for the delete confirm button */
    deleteTestConfirm() {
        DATABASE_MANAGER.deleteTest(currentTest.id);
        currentTest = null; // TODO cancel button
        backToMain(true);
    }
}

PAGES.view = new ViewPage();

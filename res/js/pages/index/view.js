const viewPageView = document.getElementById('view-page');

const viewPageTitle = [document.getElementById('view-test-title'), document.getElementById('view-test-title2')];
const viewPageDescription = document.getElementById('view-test-description');
const viewPageCreatedDate = document.getElementById('view-test-created-date');
const viewPageModificationDate = document.getElementById('view-test-modification-date');
const viewPageColumnsList = document.getElementById('view-test-columns');
const viewPageDataTableHeader = document.getElementById('view-test-data-header');
const viewPageDataTableBody = document.getElementById('view-test-data-body');

const viewColumnModal = new Modal(document.getElementById('view-test-column-modal'));
const viewColumnModalTitle1 = document.getElementById('modal-view-column-title1');
const viewColumnModalTitle2 = document.getElementById('modal-view-column-title2');
const viewColumnModalDescription = document.getElementById('modal-view-column-description');
const viewColumnModalSettings = document.getElementById('modal-view-column-settings');

const viewDataModal = new Modal(document.getElementById('view-test-data-modal'));
const viewDataModalContent = document.getElementById('view-test-data-content');
const viewDataModalId = document.getElementById('view-test-data-id');

const viewColumnTemplate = document.getElementById('view-column-child-template');
const viewDataTemplate = document.getElementById('view-data-child-template');

class ViewPage extends Page {
    constructor() {
        super(viewPageView, "view", true);

        document.getElementById('view-play-button').onclick = () => UTILS.playTestPage();
        document.getElementById('view-eval-button').onclick = () => UTILS.evalTestPage();
        document.getElementById('view-edit-button').onclick = () => UTILS.editTestPage();
        document.getElementById('view-export-button').onclick = () => UTILS.exportTest();
        document.getElementById('view-delete-button').onclick = () => UTILS.deleteTest();

        viewColumnModal.onhide = this.closeColumnModal.bind(this);
        viewDataModal.onhide = this.closeDataModal.bind(this);

        this.columnsModalNav = new NavigationBar(document.getElementById('view-column-nav-bar'), [{className: "nav-edit", onclick: () => UTILS.editTestPage()}]);
        this.columnsModalNav.onfirst = this.firstColumn.bind(this); 
        this.columnsModalNav.onprevious = this.previousColumn.bind(this); 
        this.columnsModalNav.onnext = this.nextColumn.bind(this); 
        this.columnsModalNav.onlast = this.lastColumn.bind(this); 

        this.dataModalNav = new NavigationBar(document.getElementById('view-data-nav-bar'), [{className: "nav-edit", onclick: () => UTILS.editTestPage()}]);
        this.dataModalNav.onfirst = this.firstData.bind(this); 
        this.dataModalNav.onprevious = this.previousData.bind(this); 
        this.dataModalNav.onnext = this.nextData.bind(this); 
        this.dataModalNav.onlast = this.lastData.bind(this); 
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
            e.children[0].onkeydown = onReturnClick;

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
                e.appendChild(currentTest.columns[j].getViewView(currentTest.data[i][j]));
                row.children[0].appendChild(e);
            }
            row.children[0].onclick = () => {
                this.dataClickCallback(i);
            }
            row.children[0].onkeydown = onReturnClick;
            viewPageDataTableBody.appendChild(row);
        }

        viewColumnModal.id = -1;
        viewDataModal.id = -1;
        I18N.setPageTitle(currentTest.title);
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

        if (Modal.currentModal) hideModal();
    }

    /* when a key is press */
    onkeydown(event) {
        switch (event.keyCode) {
            case KeyboardEvent.DOM_VK_RIGHT:
                if (Modal.currentModal === viewColumnModal) {
                    this.nextColumn();
                    event.preventDefault();
                } else if (Modal.currentModal == viewDataModal) {
                    this.nextData();
                    event.preventDefault();
                }
                break;

            case KeyboardEvent.DOM_VK_LEFT:
                if (Modal.currentModal === viewColumnModal) {
                    this.previousColumn();
                    event.preventDefault();
                } else if (Modal.currentModal == viewDataModal) {
                    this.previousData();
                    event.preventDefault();
                }
                break;

            case KeyboardEvent.DOM_VK_PAGE_DOWN:
                if (Modal.currentModal === viewColumnModal) {
                    this.lastColumn();
                    event.preventDefault();
                } else if (Modal.currentModal == viewDataModal) {
                    this.lastData();
                    event.preventDefault();
                }
                break;

            case KeyboardEvent.DOM_VK_PAGE_UP:
                if (Modal.currentModal === viewColumnModal) {
                    this.firstColumn();
                    event.preventDefault();
                } else if (Modal.currentModal == viewDataModal) {
                    this.firstData();
                    event.preventDefault();
                }
                break;
        }

        if (event.altKey) {
            switch (event.keyCode) {
                case KeyboardEvent.DOM_VK_S:
                    event.preventDefault();
                    UTILS.playTestPage();
                    break;

                case KeyboardEvent.DOM_VK_G:
                    event.preventDefault();
                    UTILS.evalTestPage();
                    break;

                case KeyboardEvent.DOM_VK_E:
                    event.preventDefault();
                    UTILS.editTestPage();
                    break;
            }
        }
    }

    /* update the column modal */
    updateColumnModal(id) {
        if (Modal.currentModal !== viewColumnModal) {
            viewColumnModal.show();
        }
        if (viewColumnModal.id != id) {
            viewColumnModal.id = id;
            this.columnsModalNav.updateStatus(id <= 0, id >= currentTest.columns.length - 1);
            
            var column = currentTest.columns[id];
            viewColumnModalTitle1.textContent = column.name;
            viewColumnModalTitle2.textContent = column.name;
            viewColumnModalDescription.textContent = column.description;
            viewColumnModalSettings.replaceChild(
                column.getViewColumnSettings(),
                viewColumnModalSettings.children[0]
            );
        }
    }

    /* update the data modal */
    updateDataModal(id) {
        if (Modal.currentModal !== viewDataModal) {
            viewDataModal.show();
        }
        if (viewDataModal.id != id) {
            viewDataModal.id = id;
            this.dataModalNav.updateStatus(id <= 0, id >= currentTest.data.length - 1);

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

                viewDataModalContent.appendChild(column.getViewView(row[i]));
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
        if (viewColumnModal.id < currentTest.columns.length - 1) {
            this.updateColumnModal(viewColumnModal.id + 1); // don't add to history in order to not spam the history 
        }
    }

    /* go to the previous column */
    previousColumn() {
        if (viewColumnModal.id > 0) {
            this.updateColumnModal(viewColumnModal.id - 1);
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
        if (viewDataModal.id < currentTest.data.length - 1) {
            this.updateDataModal(viewDataModal.id + 1);
        }
    }

    /* go to the previous data */
    previousData() {
        if (viewDataModal.id > 0) {
            this.updateDataModal(viewDataModal.id - 1);
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
    }

    /* close the data modal */
    closeDataModal() {
        currentURL.searchParams.delete('data');
        history.pushState({}, '', currentURL);
    }
}

PAGES.view = new ViewPage();

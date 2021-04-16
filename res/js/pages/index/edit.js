const EDIT_AUTO_SAVE_TIME = 10 * 1000;

const editPageView = document.getElementById('edit-page');
const editPageTitle = document.getElementById('edit-test-title');
const editPageDescription = document.getElementById('edit-test-description');
const editPageColumnsList = document.getElementById('edit-test-columns');
const editPageDataTableHeader = document.getElementById('edit-test-data-header');
const editPageDataTableBody = document.getElementById('edit-test-data-body');

const editColumnModalTitle1 = document.getElementById('modal-edit-column-title1');
const editColumnModalTitle2 = document.getElementById('modal-edit-column-title2');
editColumnModalTitle2.onkeyup = () => {editColumnModalTitle1.textContent = editColumnModalTitle2.value};
const editColumnModalDescription = document.getElementById('modal-edit-column-description');
const editColumnModalSettings = document.getElementById('modal-edit-column-settings')

const editDataModalContent = document.getElementById('edit-test-data-content');
const editDataModalId = document.getElementById('edit-test-data-id');

const editColumnTemplate = document.getElementById('edit-column-child-template');
const editDataTemplate = document.getElementById('edit-data-child-template');

const editColumnModal = new Modal(document.getElementById('edit-test-column-modal'));
const editDataModal = new Modal(document.getElementById('edit-test-data-modal'));

class EditPage extends Page {
    constructor() {
        super(editPageView, 'edit', false);
        this.autoSaveId = null;

        document.getElementById('edit-add-column-button').onclick = this.addColumn.bind(this);
        document.getElementById('edit-add-data-button').onclick = this.addData.bind(this);
        document.getElementById('edit-save-button').onclick = this.saveButton.bind(this);
        document.getElementById('edit-cancel-button').onclick = this.cancelButton.bind(this);

        this.columnsModalNav = new NavigationBar(document.getElementById('edit-column-nav-bar'), [
            {className: "nav-delete", onclick: this.removeColumnModal.bind(this)}, 
            {className: "nav-add", onclick: this.addColumn.bind(this)}
        ]);
        this.columnsModalNav.onfirst = this.firstColumn.bind(this); 
        this.columnsModalNav.onprevious = this.previousColumn.bind(this); 
        this.columnsModalNav.onnext = this.nextColumn.bind(this); 
        this.columnsModalNav.onlast = this.lastColumn.bind(this); 

        this.dataModalNav = new NavigationBar(document.getElementById('edit-data-nav-bar'), [
            {className: "nav-delete", onclick: this.removeDataModal.bind(this)}, 
            {className: "nav-add", onclick: this.addData.bind(this)}
        ]);
        this.dataModalNav.onfirst = this.firstData.bind(this); 
        this.dataModalNav.onprevious = this.previousData.bind(this); 
        this.dataModalNav.onnext = this.nextData.bind(this); 
        this.dataModalNav.onlast = this.lastData.bind(this); 

        editColumnModal.onhide = this.closeColumnModal.bind(this);
        editDataModal.onhide = this.closeDataModal.bind(this);
    }

    /* When the page is loaded */
    onload() {
        var testId = currentURL.searchParams.get('test');
        if (testId == "new") {
            if (currentTest?.id != EDIT_KEY) {
                var request = DATABASE_MANAGER.getFullTest(EDIT_KEY);
                request.onsuccess = test => {
                    currentTest = test;
                    if (test.edit_id) {
                        this.initialiseNewTest();
                    } else {
                        this.loadTest();
                    }
                }

                request.onerror = this.initialiseNewTest.bind(this);
            } else if (currentTest.edit_id) {
                this.initialiseNewTest();
            } else {
                this.loadTest();
            }
        } else if (testId == "current") {
            if (currentTest?.id === EDIT_KEY) {
                this.loadTest();
            } else {
                var request = DATABASE_MANAGER.getFullTest(EDIT_KEY);
                request.onsuccess = test => {
                    currentTest = test;
                    this.loadTest();
                }
                request.onerror = backToMain;
            }
        } else {
            testId = Number(testId);
            if (testId) {
                if (currentTest?.id === EDIT_KEY) {
                    if (currentTest.edit_id == testId) {
                        this.loadTest();
                    } else {
                        this.initialiseTest(testId);
                    }
                } else {
                    var request = DATABASE_MANAGER.getFullTest(EDIT_KEY);
                    request.onsuccess = test => {
                        currentTest = test;
                        if (testId === test.edit_id) {
                            this.loadTest();
                        } else {
                            this.initialiseTest(testId);
                        }
                    }
                    request.onerror = () => this.initialiseTest(testId);
                }
            } else {
                backToMain();
            }
        }
    }

    /* When the page is updated */
    onupdate() {
        if (currentTest?.id == EDIT_KEY) {
            var testId = currentURL.searchParams.get('test');
            if (testId == "new") {
                if (testId.edit_id) {
                    this.ondelete();
                    this.onload();
                    return;
                }
            } else if (testId != "current") {
                testId = Number(testId);
                if (testId != currentTest.edit_id) {
                    this.ondelete();
                    this.onload();
                    return;
                }
            }
        } else {
            this.ondelete();
            this.onload();
            return;
        }
        this.updateModal();
    }

    /* verify if the url show any modal */
    updateModal() {
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


    /* when the page is deleted */
    ondelete() {
        if (currentTest?.id == EDIT_KEY) this.saveTest(); // save only if it's a edit test
        clearInterval(this.pageAutoSaveId);
        this.pageAutoSaveId = null;
    }

    /* create a new edit test from a test already existing */
    async initialiseTest(id) {
        if (currentTest?.id !== EDIT_KEY || await this.showEraseWarning(id)) { // alert the user if we erase a currently edit test
            var request = DATABASE_MANAGER.getFullTest(id);
            request.onsuccess = test => {
                currentTest = test;
                currentTest.edit_id = id;
                currentTest.id = EDIT_KEY;
                this.loadTest();
            }

            request.onerror = backToMain;
        }
    }

    /* initialise a new test */
    async initialiseNewTest() {
        if (currentTest?.id !== EDIT_KEY || await this.showEraseWarning()) {
            currentTest = new Test(I18N.getTranslation("default-test-title"), I18N.getTranslation("default-test-description"));
            currentTest.id = EDIT_KEY;
            this.loadTest();
        }
    }

    async showEraseWarning(id) {
        if (id != null && !await DATABASE_MANAGER.testExist(id)) {
            backToMain(false);
            return false;
        }
        this.loadTest();
        var r = await Modal.showActionModal(
            'warning-erase-title', 
            'warning-erase-message',
            {name: 'erase'}
        );
        if (!r) {
            currentURL.searchParams.set('test', 'current');
            history.replaceState({}, '', currentURL);
        }
        return r;
    }

    /* load the current test in the UI */
    loadTest() {
        // TODO
        editPageTitle.value = currentTest.title;
        editPageDescription.value = currentTest.description;

        removeAllChildren(editPageColumnsList);
        removeAllChildren(editPageDataTableHeader);
        removeAllChildren(editPageDataTableBody);

        this.onvisibilitychange(); // set auto save automatic

        var row = editDataTemplate.content.cloneNode(true);
        row.querySelector('.min').innerHTML = '<x-i18n key="edit"></x-i18n>';
        editPageDataTableHeader.appendChild(row);
        for (let i = 0; i < currentTest.columns.length; i++) {
            this.addColumnChild(i);
        }

        for (var i = 0; i < currentTest.data.length; i++) {
            this.addDataChild(i);
        }

        I18N.setPageTitle(currentTest.title);
        editPageView.classList.remove('hide');

        editDataModal.id = -1;
        editColumnModal.id = -1;
        
        this.updateModal();
    }

    /* Add a column in the UI */
    addColumnChild(index) {
        var column = currentTest.columns[index];
        var e = editColumnTemplate.content.cloneNode(true);
        e.querySelector('.test-column-text').textContent = column.name;
        e.children[0].onclick = () => {
            this.columnClickCallback(index);
        };
        e.children[0].onkeydown = onReturnClick;
        var deleteButton = e.querySelector('.column-delete-button');
        deleteButton.onclick = event => {
            event.stopPropagation();
            this.removeColumn(index);
        }
        deleteButton.onkeydown = onReturnClick;

        editPageColumnsList.appendChild(e);

        e = document.createElement('td');
        e.textContent = column.name;
        editPageDataTableHeader.children[0].appendChild(e);
    }

    /* Update a column in the UI */
    updateColumnChild(index) {
        var column = currentTest.columns[index];
        var e = editPageColumnsList.children[index];
        e.querySelector('.test-column-text').textContent = column.name;

        e = editPageDataTableHeader.children[0].children[index + 1]; // +1 because of the min td in first place
        e.textContent = column.name;
    }

    /* remove a column in the list */
    removeColumnChild(index) {
        editPageColumnsList.removeChild(editPageColumnsList.children[index]);
        this.resetColumnsClick();
    }

    /* reset onclick events in columns when the order is modified */
    resetColumnsClick() {
        for (let i = 0; i < currentTest.columns.length; i++) {
            editPageColumnsList.children[i].onclick = () => {
                this.columnClickCallback(i);
            };
        }
    }

    /* when a column is clicked */
    columnClickCallback(id) {
        this.updateColumnModal(id);
        currentURL.searchParams.set('column', id + 1);
        history.pushState({}, '', currentURL);
    }

    /* Add a data in the UI */
    addDataChild(index) {
        var row = editDataTemplate.content.cloneNode(true);
        var e;
        for (var j = 0; j < currentTest.data[index].length; j++) {
            e = document.createElement('td');
            e.appendChild(currentTest.columns[j].getViewView(currentTest.data[index][j]));
            row.children[0].appendChild(e);
        }
        row.children[0].onclick = () => {
            this.dataClickCallback(index);
        }
        row.children[0].onkeydown = onReturnClick;
        var deleteButton = row.querySelector('.data-delete-button');
        deleteButton.onclick = event => {
            event.stopPropagation();
            this.removeData(index);
        }
        deleteButton.onkeydown = onReturnClick;
        editPageDataTableBody.appendChild(row);
    }

    /* Update a data in the UI */
    updateDataChild(index) {
        var row = editPageDataTableBody.children[index];
        var e;
        for (var j = 0; j < currentTest.columns.length; j++) {
            e = row.children[j + 1]; // +1 because of the min td at first
            e.replaceChild(currentTest.columns[j].getViewView(currentTest.data[index][j]), e.children[0]);
        }
    }

    /* Update a data in the UI */
    removeDataChild(index) {
        editPageDataTableBody.removeChild(editPageDataTableBody.children[index]);
        this.resetDataClick();
    }

    /* reset onclick events in data when the order is modified */
    resetDataClick() {
        for (let i = 0; i < currentTest.data.length; i++) {
            editPageDataTableBody.children[i].onclick = () => {
                this.dataClickCallback(i);
            };
            editPageDataTableBody.children[i].querySelector('.data-delete-button').onclick = event => {
                event.stopPropagation();
                this.removeData(i);
            }
        }
    }

    /* reload the entire UI of the data set */
    reloadData() {
        removeAllChildren(editPageDataTableHeader);
        removeAllChildren(editPageDataTableBody);

        var e;
        var row = editDataTemplate.content.cloneNode(true);
        row.querySelector('.min').innerHTML = '<x-i18n key="edit"></x-i18n>';
        for (var i = 0; i < currentTest.columns.length; i++) {
            e = document.createElement('td');
            e.textContent = currentTest.columns[i].name;
            row.children[0].appendChild(e);
        }
        editPageDataTableHeader.appendChild(row);

        for (var i = 0; i < currentTest.data.length; i++) {
            this.addDataChild(i);
        }
    }

    /* when a data is clicked */
    dataClickCallback(id) {
        this.updateDataModal(id);
        currentURL.searchParams.set('data', id + 1);
        history.pushState({}, '', currentURL);
    }

    /* when the visibility of the page change */
    onvisibilitychange() {
        if (document.hidden) {
            this.saveTest();
            clearInterval(this.pageAutoSaveId);
            this.pageAutoSaveId = null;
        } else {
            this.pageAutoSaveId = setInterval(this.saveTest.bind(this), EDIT_AUTO_SAVE_TIME);
        }
    }

    /* when a key is press */
    onkeydown(event) {
        if (!event.altKey) return;

        switch (event.keyCode) {
            case KeyboardEvent.DOM_VK_RIGHT:
                if (Modal.currentModal === editColumnModal) {
                    this.nextColumn();
                    event.preventDefault();
                } else if (Modal.currentModal == editDataModal) {
                    this.nextData();
                    event.preventDefault();
                }
                break;

            case KeyboardEvent.DOM_VK_LEFT:
                if (Modal.currentModal === editColumnModal) {
                    this.previousColumn();
                    event.preventDefault();
                } else if (Modal.currentModal == editDataModal) {
                    this.previousData();
                    event.preventDefault();
                }
                break;

            case KeyboardEvent.DOM_VK_DOWN:
            case KeyboardEvent.DOM_VK_PAGE_DOWN:
                if (Modal.currentModal === editColumnModal) {
                    this.lastColumn();
                    event.preventDefault();
                } else if (Modal.currentModal == editDataModal) {
                    this.lastData();
                    event.preventDefault();
                }
                break;

            case KeyboardEvent.DOM_VK_UP:
            case KeyboardEvent.DOM_VK_PAGE_UP:
                if (Modal.currentModal === editColumnModal) {
                    this.firstColumn();
                    event.preventDefault();
                } else if (Modal.currentModal == editDataModal) {
                    this.firstData();
                    event.preventDefault();
                }
                break;

            case KeyboardEvent.DOM_VK_N:
                event.preventDefault();
                if (Modal.currentModal === editColumnModal) {
                    this.addColumn();
                } else if (Modal.currentModal == editDataModal) {
                    this.addData();
                } else if (event.shiftKey) {
                    this.addColumn();
                } else {
                    this.addData();
                }
                break;

            case KeyboardEvent.DOM_VK_C:
                event.preventDefault();
                this.cancelButton();
                break;

            case KeyboardEvent.DOM_VK_S:
                event.preventDefault();
                this.saveButton();
                break;
        }
    }


    /* save the edited test */
    saveTest() {
        currentTest.title = editPageTitle.value;
        currentTest.description = editPageDescription.value;

        if (Modal.currentModal === editColumnModal) this.applyColumnModal();
        else if (Modal.currentModal == editDataModal) this.applyDataModal();

        DATABASE_MANAGER.updateTest(currentTest);
    }

    /* save the current data in modals */
    applyColumnModal() {
        if (editColumnModal.id >= 0) {
            console.assert(Modal.currentModal === editColumnModal, "The edit test modal must be column");
            var column = currentTest.columns[editColumnModal.id];
            column.name = editColumnModalTitle2.value;
            column.description = editColumnModalDescription.value;

            column.setEditColumnSettings(editColumnModalSettings);

            this.updateColumnChild(editColumnModal.id);
        }
    }

    applyDataModal() {
        if (editDataModal.id >= 0) {
            console.assert(Modal.currentModal === editDataModal, "The edit test modal must be data");
            var row = currentTest.data[editDataModal.id];
            for (var i = 0; i < currentTest.columns.length; i++) {
                currentTest.columns[i].setValueFromView(row[i], editDataModalContent.children[i * 2 + 1]);
            }
            this.updateDataChild(editDataModal.id);
        }
    }

    /* callback for the cancel button */
    cancelButton() {
        Modal.showActionModal(
            'warning-lose-changes-title', 
            'warning-lose-changes-message', 
            {name: 'quit'}
        ).then(quit => {
            if (quit) {
                var id = currentTest.edit_id;
                currentTest = null;
                DATABASE_MANAGER.deleteTest(EDIT_KEY);
                if (id) UTILS.viewTestPage(id);
                else backToMain(true);
            }
        });
    }

    saveButton() {
        this.saveTest();
        defaultPage.needReload = true;
        currentTest.registerModificationDate();
        if (currentTest.edit_id) {
            currentTest.id = currentTest.edit_id;
            delete currentTest.edit_id;
            DATABASE_MANAGER.removeAllPlayContext(currentTest.id); // TODO: improve only make a reset data flag and save settings
            DATABASE_MANAGER.updateTest(currentTest).onsuccess = event => {
                UTILS.viewTestPage(event.target.result);
            };
            DATABASE_MANAGER.deleteTest(EDIT_KEY);
        } else {
            delete currentTest.id;
            DATABASE_MANAGER.addNewTest(currentTest).onsuccess = event => {
                UTILS.viewTestPage(event.target.result);
            };
            DATABASE_MANAGER.deleteTest(EDIT_KEY);
        }
    }

    /* add a column */
    addColumn() {
        var pos = currentTest.addColumn(new ColumnString(I18N.getTranslation("default-column-title")));
        this.addColumnChild(pos);
        this.columnClickCallback(pos);
        this.reloadData();
    }

    /* remove a column */
    removeColumn(index) {
        currentTest.removeColumn(index);
        this.removeColumnChild(index);
        this.reloadData();
    }

    /* add a data */
    addData() {
        var pos = currentTest.addData();
        this.addDataChild(pos);
        this.dataClickCallback(pos);
    }

    /* remove a data */
    removeData(index) {
        currentTest.removeData(index);
        this.removeDataChild(index);
    }

    /* update the modal from an id */
    updateColumnModal(id) {
        if (Modal.currentModal !== editColumnModal) {
            if (Modal.currentModal) currentModal.hide();
            editColumnModal.show();
        }
        if (editColumnModal.id != id) {
            if (editColumnModal.id >= 0) this.applyColumnModal();
            editColumnModal.id = id;
            this.columnsModalNav.updateStatus(id <= 0 ? 1 : id >= currentTest.columns.length - 1 ? 2 : 0);
            
            var column = currentTest.columns[id];
            editColumnModalTitle1.textContent = column.name;
            editColumnModalTitle2.value = column.name;
            editColumnModalTitle2.focus();
            editColumnModalDescription.value = column.description;

            editColumnModalSettings.replaceChild(
                column.getEditColumnSettings(),
                editColumnModalSettings.children[0]
            );
        }
    }

    /* remove the current column shown */
    removeColumnModal() {
        var id = editColumnModal.id;
        this.removeColumn(id);
        editColumnModal.id = -1; // very important, required to not save the current remove data
        if (currentTest.columns.length > 0) {
            this.updateColumnModal(id > 0 ? id - 1 : 0);
        } else {
            Modal.hideModal();
        }
    }

    /* go to the next column */
    nextColumn() {
        if (editColumnModal.id < currentTest.columns.length - 1) {
            this.updateColumnModal(editColumnModal.id + 1); // don't add to history in order to not spam the history 
        }
    }

    /* go to the first column */
    firstColumn() {
        this.updateColumnModal(0);
    }

    /* go to the previous column*/
    previousColumn() {
        if (editColumnModal.id > 0) {
            this.updateColumnModal(editColumnModal.id - 1);
        }
    }

    /* go to the last column*/
    lastColumn() {
        this.updateColumnModal(currentTest.columns.length - 1);
    }

    /* close the column modal */
    closeColumnModal() {
        this.applyColumnModal();
        currentURL.searchParams.delete('column');
        history.pushState({}, '', currentURL);
    }

    /* update the modal of data */
    updateDataModal(id) {
        if (Modal.currentModal != editDataModal) {
            if (Modal.currentModal) Modal.hideModal();
            editDataModal.show();
        }
        if (editDataModal.id != id) {

            if (editDataModal.id >= 0) this.applyDataModal();
            editDataModal.id = id;
            this.dataModalNav.updateStatus(id <= 0 ? 1 : id >= currentTest.data.length - 1 ? 2 : 0);

            var row = currentTest.data[id];
            editDataModalId.textContent = id + 1;
            removeAllChildren(editDataModalContent);
            var e;
            var column;
            for (var i = 0; i < row.length; i++) {
                column = currentTest.columns[i];
                e = document.createElement('h3');
                e.textContent = column.name + ":";
                e.classList = ['no-margin']
                editDataModalContent.appendChild(e);

                e = column.getEditView(row[i]);
                editDataModalContent.appendChild(e);
                if (i <= 0) e.focus();
            }
        }
    }

    /* remove the current data shown */
    removeDataModal() {
        var id = editDataModal.id;
        this.removeData(id);
        editDataModal.id = -1; // very important, required to not save the current remove data
        if (currentTest.data.length > 0) {
            this.updateDataModal(id > 0 ? id - 1 : 0);
        } else {
            Modal.hideModal();
        }
    }

    /* go to the next data*/
    nextData() {
        if (editDataModal.id < currentTest.data.length - 1) {
            this.updateDataModal(editDataModal.id + 1);
        }
    }

    /* go to the previous data */
    previousData() {
        if (editDataModal.id > 0) {
            this.updateDataModal(editDataModal.id - 1);
        }
    }

    /* go to the first data */
    firstData() {
        this.updateDataModal(0);
    }

    /* go to the last edit data */
    lastData() {
        this.updateDataModal(currentTest.data.length - 1);
    }

    /* close the data modal */
    closeDataModal() {
        this.applyDataModal();
        currentURL.searchParams.delete('data');
        history.pushState({}, '', currentURL);
    }
}

PAGES.edit = new EditPage();

const exportModalSelect = document.getElementById('export-test-select');
const exportModalCsv = document.getElementById('export-csv');
const exportModalCsvColumnName = document.getElementById('export-csv-column-name');
const exportModalCsvColumnType = document.getElementById('export-csv-column-type');

class Utils {
    constructor() {
        document.getElementById('test-delete-confirm-button').onclick = this.deleteTestConfirm.bind(this);

        document.getElementById('export-form').onsubmit = this.exportTestConfirm.bind(this);
        exportModalSelect.onchange = this.exportWarningCsv.bind(this);
    }
    /* redirect to the view page of a test */
    viewTestPage(id) {
        if (id) {
            currentURL.searchParams.set('page', 'view');
            currentURL.searchParams.set('test', id);
            window.history.pushState({}, 'View page', currentURL);
            loadPage();
        }
    }

    /* redirect to add a test */
    addTestRedirect() {
        currentURL.searchParams.set('page', 'edit');
        currentURL.searchParams.set('test', 'new');
        window.history.pushState({}, 'Edit page', currentURL);
        loadPage();
    }

    /* open the play page if id not set keep the same test index of the current url */
    playTestPage(id) {
        currentURL.searchParams.set('page', 'play-card');
        if (id) currentURL.searchParams.set('test', id);
        history.pushState({}, 'Play card', currentURL);
        loadPage();
    }

    /* open the eval page if id not set keep the same test index of the current url */
    evalTestPage(id) {
        currentURL.searchParams.set('page', 'eval-settings');
        if (id) currentURL.searchParams.set('test', id);
        history.pushState({}, 'Eval settings', currentURL);
        loadPage();
    }

    /* open the edit page if id not set keep the same test index of the current url */
    editTestPage(id) {
        currentURL.searchParams.set('page', 'edit');
        if (id) currentURL.searchParams.set('test', id);
        history.pushState({}, 'Edit test', currentURL);
        loadPage();
    }

    /* delete the test */
    deleteTest(id) {
        this.data = id || currentTest.id;
        showModal(currentModal = 'test-delete-confirm');
        history.pushState({}, 'Modal');
    }

    /* callback for the delete confirm button */
    deleteTestConfirm() {
        DATABASE_MANAGER.deleteTest(this.data);
        currentTest = null; // TODO cancel button
        backToMain(true);
    }

    /* export a test */
    exportTest(id) {
        if (id && id !== currentTest?.id) {
            var request = DATABASE_MANAGER.getFullTest(id);
            request.onsuccess = test => {
                this.data = test;
                this.loadExportModal();
            };
        } else if (currentTest) {
            this.data = currentTest;
            this.loadExportModal();
        }
    }

    /* load export modal */
    loadExportModal() {
        showModal('export-test')
        currentModal = 'export-test';
        history.pushState({}, 'Modal');
        this.exportWarningCsv();
    }

    /* callback to show the warning */
    exportWarningCsv() {
        if (exportModalSelect.value == 'csv') {
            exportModalCsv.classList.remove('hide');
        } else {
            exportModalCsv.classList.add('hide');
        }
    }

    /* confirm the export */
    exportTestConfirm(event) {
        event.preventDefault();
        hideModal(currentModal);
        currentModal = null;

        if (exportModalSelect.value == 'dkl') {
            FILE_MANAGER.exportTest(this.data);
        } else {
            FILE_MANAGER.exportCsvTest(this.data, exportModalCsvColumnName.checked, exportModalCsvColumnType.checked);
        }
        this.data = null;
    }

    /* duplicate the test */
    duplicateTest(id) {
        if (id && id !== currentTest?.id) {
            var request = DATABASE_MANAGER.getFullTest(id);
            request.onsuccess = test => {
                this.doDuplicateTest(test);
            };
        } else if (currentTest) {
            this.doDuplicateTest(currentTest);
        }
    }

    /* do the duplication of test, see #duplicateTest */
    doDuplicateTest(test) {
        this.data = test.title;
        test.title = test.title + getTranslation('duplicate-suffix');
        DATABASE_MANAGER.addNewTest(test).onsuccess = () => {
            defaultPage.reloadList();
            test.title = this.data;
        }
    }
}

const UTILS = new Utils();
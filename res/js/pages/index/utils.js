const importTestModal = new Modal(document.getElementById('import-test-modal'));
const importModalInput = document.getElementById('import-test-input');
const importModalSelect = document.getElementById('import-test-select');
const importModalCsv = document.getElementById('import-csv');
const importModalCsvColumnName = document.getElementById('import-csv-column-name');
const importModalCsvColumnType = document.getElementById('import-csv-column-type');
const importModalTabFile = document.getElementById('import-tab-file');
const importModalTabFileDiv = document.getElementById('import-file');
const importModalTabSync = document.getElementById('import-tab-sync');
const importModalTabSyncDiv = document.getElementById('import-sync');
const importUrlInput = document.getElementById('import-url-input');

const exportModal = new Modal(document.getElementById('export-test-modal'));
const exportModalSelect = document.getElementById('export-test-select');
const exportModalCsv = document.getElementById('export-csv');
const exportModalCsvColumnName = document.getElementById('export-csv-column-name');
const exportModalCsvColumnType = document.getElementById('export-csv-column-type');

class Utils {
    constructor() {
        document.getElementById('import-form').onsubmit = this.importTestCallback.bind(this);
        importModalInput.onchange = this.importFileChange.bind(this);
        importModalSelect.onchange = this.importSelectChange.bind(this);

        document.getElementById('export-form').onsubmit = this.exportTestConfirm.bind(this);
        exportModalSelect.onchange = this.exportWarningCsv.bind(this);
        exportModal.onhide = () => this.data = null;

        this.importModalTab = "file";
        importModalTabFile.onclick = this.importModalTabFile.bind(this);
        importModalTabSync.onclick = this.importModalTabSync.bind(this);
        importModalTabFile.onkeypress = onReturnClick;
        importModalTabSync.onkeypress = onReturnClick;
    }
    /* redirect to the view page of a test */
    viewTestPage(id) {
        currentURL.searchParams.set('page', 'view');
        currentURL.searchParams.set('test', id || currentTest.id);
        window.history.pushState({}, 'View page', currentURL);
        loadPage();
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
        this.requiredPlayable(id || currentTest.id).then(playable => {
            if (playable) {
                currentURL.searchParams.set('page', 'play-card');
                if (id) currentURL.searchParams.set('test', id);
                history.pushState({}, 'Play card', currentURL);
                loadPage();
            }
        });
    }

    /* open the eval page if id not set keep the same test index of the current url */
    evalTestPage(id) {
        this.requiredPlayable(id || currentTest.id).then(playable => {
            if (playable) {
                currentURL.searchParams.set('page', 'eval-settings');
                if (id) currentURL.searchParams.set('test', id);
                history.pushState({}, 'Eval settings', currentURL);
                loadPage();
            }
        });
    }

    /* test if a test is playable if no, show a modal */
    async requiredPlayable(id) {
        if (await DATABASE_MANAGER.getPlayable(id)) {
            return true;
        } else {
            if (await Modal.showActionModal(
                'error-playable-title',
                'error-playable-message', 
                {name: 'edit', icon: '/WebDiakoluo/res/img/edit_w.svg'}
            )) {
                this.editTestPage(id);
            }
            return false;
        }
    }

    /* open the edit page if id not set keep the same test index of the current url */
    editTestPage(id) {
        currentURL.searchParams.set('page', 'edit');
        if (id) currentURL.searchParams.set('test', id);
        history.pushState({}, 'Edit test', currentURL);
        loadPage();
    }

    /* delete the test */
    async deleteTest(id) {
        const header = await DATABASE_MANAGER.getHeader(id || currentTest.id);
        Modal.showActionModal(
            'delete-test-title', 
            'delete-test-message', 
            {name: 'delete', icon: '/WebDiakoluo/res/img/delete_w.svg'},
            {important: true})
        .then(async response => {
            if (response) {
                if (header.sync) {
                    try {
                        var s = await SyncManager.getSyncFromTest(header)
                    } catch (e) {
                        console.error("Error while deleting test", e);
                    }
                    if (s) await s.deleteTest();
                    else DATABASE_MANAGER.deleteTest(id || currentTest.id);
                } else {
                    DATABASE_MANAGER.deleteTest(id || currentTest.id);
                }
                currentTest = null; // TODO cancel button
                defaultPage.needReload = true;
                backToMain(true);
            }
        });      
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
        exportModal.show();
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
        
        if (exportModalSelect.value == 'dkl') {
            FILE_MANAGER.exportTest(this.data);
        } else {
            FILE_MANAGER.exportCsvTest(this.data, exportModalCsvColumnName.checked, exportModalCsvColumnType.checked);
        }
        exportModal.hide();
        this.data = null;
    }

    /* export all tests */
    exportAllTest() {
        FILE_MANAGER.exportAllTest().catch(
            () => Modal.showOkModal('error-export-all-title', 'error-export-all-message', {important: true})
        );
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
        var newTest = Object.assign(new Test(), test);
        delete newTest.sync;
        delete newTest.syncData;
        newTest.title = newTest.title + I18N.getTranslation('duplicate-suffix');
        DATABASE_MANAGER.addNewTest(newTest).onsuccess = () => {
            defaultPage.reloadList();
        }
    }

    /* import a test */
    importTest() {
        importTestModal.show();
        this.importFileChange();
        this.importSelectChange();
    }

    /* the import test callback */
    importTestCallback(event) {
        event.preventDefault();
        if (this.importModalTab === 'file') {
            importTestModal.hide();

            for (var i = 0; i < importModalInput.files.length; i++) {
                FILE_MANAGER.importTest(
                    importModalInput.files[i],
                importModalInput.files[i], 
                    importModalInput.files[i],
                    importModalSelect.value == 'dkl',
                importModalSelect.value == 'dkl', 
                    importModalSelect.value == 'dkl',
                    importModalCsvColumnName.checked,
                importModalCsvColumnName.checked, 
                    importModalCsvColumnName.checked,
                    importModalCsvColumnType.checked
                )
                .then(() => defaultPage.reloadList())
                .catch(() => Modal.showOkModal('error-import-title', 'error-import-message', {important: true}));
            }
        } else {
            const url = new URL(importUrlInput.value);
            if (url.origin === currentURL.origin && (currentURL.pathname === url.pathname ||
                                                    currentURL.pathname + 'index.html' === url.pathname) ||
                                                    currentURL.pathname === url.pathname + 'index.html') {
                const host = url.searchParams.get('host');
                const serverTestId = url.searchParams.get('id');
                if (!host || !serverTestId) {
                    importTestModal.hide();
                    Modal.showOkModal('error-import-title', 'error-import-message', {important: true});
                    return;
                }

                this.importFromUrl(host, serverTestId,
                    {username: url.searchParams.get('username'), password: url.searchParams.get('password')});
            } else {
                var match = url.toString().match(/(.+)\/test\/(.+)$/);

                if (!match) {
                    importTestModal.hide();
                    Modal.showOkModal('error-import-title', 'error-import-message', {important: true});
                    return;
                }
                var [_, host, serverTestId] = match;
                this.importFromUrl(host, serverTestId, {});
            }
        }
    }

    importFromUrl(host, serverTestId, credentials) {
        importTestModal.hide();
        var sync = {
            host,
            serverTestId,
            credentials,
            authAccount: SyncManager.LINK
        };
        const syncObject = SyncManager.getSyncFromSync(sync);
        syncObject.updateTest().then(() => {
            SyncManager.isSynced = true;
            SyncManager.onVisibilityChange();

            defaultPage.reloadList();

            if (sync.testId) {
                UTILS.viewTestPage(sync.testId);
            }
        }).catch(e => {
            Modal.showOkModal('error-import-title', 'error-import-message', {important: true});
            console.error("Error while importing the test", e);
        });
    }

    /* when a file is inputted */
    importFileChange() {
        if (importModalInput.files.length > 0) {
            importModalInput.setCustomValidity();
            FILE_MANAGER.getTypeFile(importModalInput.files[0]).then(
                (formatFile) => {
                    importModalSelect.value = formatFile ? 'dkl' : 'csv'
                    this.importSelectChange();
                }
            );
            
        }
    }

    /* when the select change */
    importSelectChange() {
        if (importModalSelect.value === 'dkl') {
            importModalCsv.classList.add('hide');
        } else {
            importModalCsv.classList.remove('hide');
        }
    }

    settings() {
        currentURL.searchParams.set('page', 'settings');
        history.pushState({}, 'Settings', currentURL);
        loadPage();
    }

    importModalTabFile() {
        if (this.importModalTab !== "file") {
            this.importModalTab = "file";
            importModalTabFile.classList.add('header-tab-active');
            importModalTabSync.classList.remove('header-tab-active');
            importModalTabFileDiv.classList.remove('hide');
            importModalTabSyncDiv.classList.add('hide');

            importModalInput.required = true;
            importModalSelect.required = true;
            importUrlInput.required = false;
        }
    }

    importModalTabSync() {
        if (this.importModalTab !== "sync") {
            this.importModalTab = "sync";
            importModalTabFile.classList.remove('header-tab-active');
            importModalTabSync.classList.add('header-tab-active');
            importModalTabFileDiv.classList.add('hide');
            importModalTabSyncDiv.classList.remove('hide');

            importModalInput.required = false;
            importModalSelect.required = false;
            importUrlInput.required = true;
        }
    }
}

const UTILS = new Utils();
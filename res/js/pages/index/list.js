const listPageView = document.getElementById('list-page');
const listPageTestList = document.getElementById('list-test');

const testListTemplate = document.getElementById('list-test-child-template');

const importModalInput = document.getElementById('import-test-input');
const importModalSelect = document.getElementById('import-test-select');
const importModalCsv = document.getElementById('import-csv');
const importModalCsvColumnName = document.getElementById('import-csv-column-name');
const importModalCsvColumnType = document.getElementById('import-csv-column-type');

document.getElementById('list-add-button').onclick = addTestRedirect;

class ListPage extends Page {
    constructor() {
        super(listPageView, "", false);

        document.getElementById('import-form').onsubmit = this.importTestCallback.bind(this);
        document.getElementById('list-import-button').onclick = this.importTest.bind(this);
        document.getElementById('list-export-all-button').onclick = this.exportAllTest.bind(this);
        
        importModalInput.onchange = this.importFileChange.bind(this);
        importModalSelect.onchange = this.importSelectChange.bind(this);
    }

    /* load list page */
    onload() {
        updatePageTitle('title-index.html');
        listPageView.classList.remove('hide');
        this.reloadList();
    }

    onkeydown(event) {
        if (event.keyCode == KeyboardEvent.DOM_VK_ESCAPE) {
            if (currentModal)
                hideModal(currentModal);
        }
    }

    /* reload the test list */
    reloadList() {
        removeAllChildren(listPageTestList);
        DATABASE_MANAGER.forEachHeader().onsuccess = function(event) {
            var cursor = event.target.result;
            if (cursor) {
                var t = testListTemplate.content.cloneNode(true);
                var v = cursor.value;
                var id = cursor.value.id;
                if (id == EDIT_KEY) {
                    t.querySelector('.test-title').textContent = getTranslation("edited-test");
                    t.querySelector('.test-description').textContent = v.title;
                    t.children[0].onclick = function() {
                        currentURL.searchParams.set('page', 'edit');
                        currentURL.searchParams.set('test', 'current');
                        window.history.pushState({}, 'Edit page', currentURL);
                        loadPage();
                    }
                    listPageTestList.insertBefore(t, listPageTestList.firstChild); // insert at first
                } else {
                    t.querySelector('.test-title').textContent = v.title;
                    t.querySelector('.test-description').textContent = v.description;
                    t.children[0].onclick = function() {
                        viewTestPage(id);
                    }
                    listPageTestList.appendChild(t);
                    cursor.continue();
                }
            }
        };
    }

    importTest() {
        showModal('import-test');
        currentModal = 'import-test';
        history.pushState({}, '');
        this.importFileChange();
        this.importSelectChange();
    }

    importTestCallback(event) {
        event.preventDefault();
        hideModal('import-test');

        for (var i = 0; i < importModalInput.files.length; i++) {
            FILE_MANAGER.importTest(
                importModalInput.files[i], 
                importModalSelect.value == 'dkl', 
                importModalCsvColumnName.checked, 
                importModalCsvColumnType.checked
            ).then(this.reloadList).catch(() => console.warn("Error while importing test"));
        }
    }

    importFileChange() {
        if (importModalInput.files.length > 0) {
            FILE_MANAGER.getTypeFile(importModalInput.files[0]).then(
                (formatFile) => {
                    importModalSelect.value = formatFile ? 'dkl' : 'csv'
                    this.importSelectChange();
                }
            );
            
        }
    }

    importSelectChange() {
        if (importModalSelect.value === 'dkl') {
            importModalCsv.classList.add('hide');
        } else {
            importModalCsv.classList.remove('hide');
        }
    }

    exportAllTest() {
        FILE_MANAGER.exportAllTest();
    }
}

const defaultPage = new ListPage();
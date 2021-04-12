const listPageView = document.getElementById('list-page');
const listPageTestList = document.getElementById('list-test');

const testListTemplate = document.getElementById('list-test-child-template');

const importModalInput = document.getElementById('import-test-input');
const importModalSelect = document.getElementById('import-test-select');
const importModalCsv = document.getElementById('import-csv');
const importModalCsvColumnName = document.getElementById('import-csv-column-name');
const importModalCsvColumnType = document.getElementById('import-csv-column-type');

document.getElementById('list-add-button').onclick = UTILS.addTestRedirect;

class ListPage extends Page {
    constructor() {
        super(listPageView, "", false);

        document.getElementById('import-form').onsubmit = this.importTestCallback.bind(this);
        document.getElementById('list-import-button').onclick = this.importTest.bind(this);
        document.getElementById('list-export-all-button').onclick = this.exportAllTest.bind(this);
        
        importModalInput.onchange = this.importFileChange.bind(this);
        importModalSelect.onchange = this.importSelectChange.bind(this);

        this.contextMenu = new ContextMenu('list-page-context-menu');
        document.getElementById('list-test-play-button').onclick = () => UTILS.playTestPage(this.contextMenu.dataIndex);
        document.getElementById('list-test-eval-button').onclick = () => UTILS.evalTestPage(this.contextMenu.dataIndex);
        document.getElementById('list-test-edit-button').onclick = () => UTILS.editTestPage(this.contextMenu.dataIndex);
        document.getElementById('list-test-duplicate-button').onclick = () => UTILS.duplicateTest(this.contextMenu.dataIndex);
        document.getElementById('list-test-export-button').onclick = () => UTILS.exportTest(this.contextMenu.dataIndex);
        document.getElementById('list-test-delete-button').onclick = () => UTILS.deleteTest(this.contextMenu.dataIndex);
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
            else
                this.contextMenu.disimiss();
        }
    }

    /* when a context menu is used on a test */
    oncontextmenu(event, index, playable) {
        event.preventDefault();
        this.contextMenu.show(event.pageX, event.pageY);
        this.contextMenu.dataIndex = index;
        this.contextMenu.dataPlayable = playable;
    }

    /* when the page is clicked */
    onclick(event) {
        if (this.contextMenu.disimiss()) {
            event.preventDefault();
        }
    }

    /* reload the test list */
    reloadList() {
        removeAllChildren(listPageTestList);
        DATABASE_MANAGER.forEachHeader().onsuccess = event => {
            var cursor = event.target.result;
            if (cursor) {
                var t = testListTemplate.content.cloneNode(true);
                var v = cursor.value;
                var id = cursor.value.id;
                var playable = cursor.value.playable;
                if (id == EDIT_KEY) {
                    t.querySelector('.test-title').textContent = getTranslation("edited-test");
                    t.querySelector('.test-description').textContent = v.title;
                    t.children[0].onclick = function() {
                        UTILS.editTestPage('current');
                    }
                    listPageTestList.insertBefore(t, listPageTestList.firstChild); // insert at first
                } else {
                    t.querySelector('.test-title').textContent = v.title;
                    t.querySelector('.test-description').textContent = v.description;
                    t.children[0].onclick = function() {
                        UTILS.viewTestPage(id);
                    }
                    t.children[0].oncontextmenu = e => this.oncontextmenu(e, id, playable);
                    listPageTestList.appendChild(t);
                    cursor.continue();
                }
            }
        };
    }

    /* import a test */
    importTest() {
        showModal('import-test');
        currentModal = 'import-test';
        history.pushState({}, '');
        this.importFileChange();
        this.importSelectChange();
    }

    /* the import test callback */
    importTestCallback(event) {
        event.preventDefault();
        hideModal('import-test');

        for (var i = 0; i < importModalInput.files.length; i++) {
            FILE_MANAGER.importTest(
                importModalInput.files[i], 
                importModalSelect.value == 'dkl', 
                importModalCsvColumnName.checked, 
                importModalCsvColumnType.checked
            ).then(this.reloadList.bind(this)).catch(() => console.warn("Error while importing test"));
        }
    }

    /* when a file is inputted */
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

    /* when the select change */
    importSelectChange() {
        if (importModalSelect.value === 'dkl') {
            importModalCsv.classList.add('hide');
        } else {
            importModalCsv.classList.remove('hide');
        }
    }

    /* export all tests */
    exportAllTest() {
        FILE_MANAGER.exportAllTest();
    }
}

const defaultPage = new ListPage();
const listPageView = document.getElementById('list-page');
const listPageTestList = document.getElementById('list-test');

const testListTemplate = document.getElementById('list-test-child-template');

const listPageImportInput = document.getElementById('import-test-input');

class ListPage extends Page {
    constructor() {
        super(listPageView, "", false);
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
                if (id == "edit") {
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
    }

    importTestCallback(event) {
        event.preventDefault();
        hideModal('import-test');

        for (var i = 0; i < listPageImportInput.files.length; i++) {
            FILE_MANAGER.importTest(listPageImportInput.files[i], this.reloadList);
        }
    }
}

const defaultPage = new ListPage();
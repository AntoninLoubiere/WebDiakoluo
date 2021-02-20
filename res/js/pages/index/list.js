const listPageView = document.getElementById('list-page');
const listPageTestList = document.getElementById('list-test');

const testListTemplate = document.getElementById('list-test-child-template');

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
}

const defaultPage = new ListPage();
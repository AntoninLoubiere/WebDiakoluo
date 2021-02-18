const listPageView = document.getElementById('list-page');
const listPageTestList = document.getElementById('list-test');

const testListTemplate = document.getElementById('list-test-child-template');

const defaultPage = new Page(listPageView, "", false, loadListPage);

function reloadTestList() {
    removeAllChildren(listPageTestList);
    forEachHeader().onsuccess = function(event) {
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
                    currentURL.searchParams.set('page', 'view');
                    currentURL.searchParams.set('test', id);
                    window.history.pushState({}, 'View page', currentURL);
                    loadPage();
                }
                listPageTestList.appendChild(t);
                cursor.continue();
            }
        }
    };
}

function loadListPage() {
    listPageView.classList.remove('hide');
    updatePageTitle('title-index.html');
    reloadTestList();
}
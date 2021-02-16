const listPageView = document.getElementById('list-page');
const listPageTestList = document.getElementById('test-list');

const testListTemplate = document.getElementById('test-child-template');

const listPage = new Page(listPageView, "", false, loadListPage);

function reloadTestList() {
    removeAllChildren(listPageTestList);
    forEachHeader().onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
            var t = testListTemplate.content.cloneNode(true);
            var v = cursor.value;
            var id = cursor.value.id;
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
    };
}

function loadListPage() {
    listPageView.classList.remove('hide');
    updatePageTitle('title-index.html');
    reloadTestList();
}
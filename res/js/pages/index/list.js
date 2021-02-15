const listPage = document.getElementById('list-page');
const listPageTestList = document.getElementById('test-list');

const testListTemplate = document.getElementById('test-child-template');

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
                const url = new URL(window.location);
                url.searchParams.set('page', 'view');
                url.searchParams.set('test', id);
                window.history.pushState({}, 'View page', url);
                loadPage();
            }
            listPageTestList.appendChild(t);
            cursor.continue();
        }
    };
}

function loadListPage() {
    currentPage = listPage;
    currentPage.classList.remove('hide');
    updatePageTitle('title-index.html');
    reloadTestList();
}
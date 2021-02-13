const listPage = document.getElementById('list-page');

function reloadTestList() {
    var testList = document.getElementById('test-list');
    while (testList.children.length) {
        testList.removeChild(testList.children[0]);
    }
    forEachHeader().onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
            var t = document.getElementById('test-child-template').content.cloneNode(true);
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
            testList.appendChild(t);
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
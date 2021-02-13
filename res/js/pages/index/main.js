const MAIN_URL = "/WebDiakoluo/index.html"

var currentPage = null;
var currentTest = null;

function initNavigation() {
    window.onpopstate = function() {
        loadPage();
    }
    document.getElementById('loading-page').classList.add('hide');
    loadPage();
}

function loadPage() {
    const url = new URL(window.location);
    var page = url.searchParams.get('page');
    if (currentPage) {
        currentPage.classList.add('hide');
    }

    if (page == 'view') {
        loadPageRequiringTest(url, page);
    } else {
        loadListPage();
    }
}

function loadPageRequiringTest(url, page) {
    var testId = Number(url.searchParams.get('test'));
    if (testId) {
        if (!currentTest || testId != currentTest.id) {
            getFullTest(testId).onsuccess = function(event) {
                var test = event.target.result;
                if (test) {
                    currentTest = test;
                    loadPageRequiringTestCallback(page);
                } else {
                    backToList();
                }
            };
        } else {
            loadPageRequiringTestCallback(page);
        }
    } else {
        backToList();
    }
}

function loadPageRequiringTestCallback(page) {
    if (page == 'view') {
        loadViewPage();
    }
}

function backToList() {
    window.history.replaceState({}, 'view_title', MAIN_URL);
    loadPage();
}

testDBCallbacks.push(initNavigation);
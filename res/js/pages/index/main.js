const MAIN_URL = "/WebDiakoluo/index.html"

var currentPage = null;
var currentTest = null;

/* init navigation */
function initNavigation() {
    window.onpopstate = function() {
        loadPage();
    }
    document.getElementById('loading-page').classList.add('hide');
    loadPage();
}

/* load a page / process the ur l*/
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

/* load a page that require a test */
function loadPageRequiringTest(url, page) {
    var testId = Number(url.searchParams.get('test'));
    if (testId) {
        if (!currentTest || testId != currentTest.id) {
            var request = getFullTest(testId);
            request.onsuccess = function(test) {
                currentTest = test;
                loadPageRequiringTestCallback(page);
            };
            request.onerror = function(event) {
                backToList();
            };
        } else {
            loadPageRequiringTestCallback(page);
        }
    } else {
        backToList();
    }
}

/* callback of the load page requiring test if a test has been imported */
function loadPageRequiringTestCallback(page) {
    if (page == 'view') {
        loadViewPage();
    }
}

/* return to the list if an error occur for example */
function backToList(newState = false) {
    if (newState) {
        window.history.pushState({}, 'Main page', MAIN_URL);
    } else {
        window.history.replaceState({}, 'Main page', MAIN_URL);
    }
    loadPage();
}

testDBCallbacks.push(initNavigation);
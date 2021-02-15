const MAIN_URL = "/WebDiakoluo/index.html"

var currentURL = new URL(window.location)
var currentPage = null;
var currentPageName = null;
var currentTest = null;
var currentModal = null;
var currentState = {};

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
    currentURL = new URL(window.location);
    var page = currentURL.searchParams.get('page');
    if (page && currentPageName == page) {
        if (page == 'view') {
            loadPageRequiringTest(page, true);
        }
    } else {
        if (currentPage) {
            currentPage.classList.add('hide');
        }
        if (currentModal) {
            hideModal(currentModal); 
            currentModal = null;
        }
        currentState = {};

        if (page == 'view') {
            loadPageRequiringTest(page);
        } else {
            loadListPage();
        }
        currentPageName = page;
    }
}

/* load a page that require a test */
function loadPageRequiringTest(page, update = false) {
    var testId = Number(currentURL.searchParams.get('test'));
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
            currentState = {};
        } else {
            if (update) {
                updatePageRequiringTestCallback(page);
            } else {
                loadPageRequiringTestCallback(page);
            }
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

/* callback of the update page requiring test if a test has been imported */
function updatePageRequiringTestCallback(page) {
    if (page == 'view') {
        updateViewPage();
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
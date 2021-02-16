const MAIN_URL = "/WebDiakoluo/index.html"

var PAGES = {};

var currentURL = new URL(window.location)
var currentPage = new Page(null, null);
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
    if (page && currentPage.name == page) {
        if (currentPage.onupdate) {
            if (currentPage.requireTest) loadPageRequiringTest(page, true);
            else currentPage.onupdate?.();
        }
    } else {
        currentPage.hidePage();
        if (currentModal) {
            hideModal(currentModal); 
            currentModal = null;
        }
        currentState = {};

        currentPage = PAGES[page] || listPage;
        if (currentPage.requireTest) {
            loadPageRequiringTest();
        } else {
            currentPage.onload?.();
        }
    }
}

function onkeydown(event) {
    currentPage.onkeydown?.(event);
}
document.onkeydown = onkeydown;

/* load a page that require a test */
function loadPageRequiringTest(page, update = false) {
    var testId = Number(currentURL.searchParams.get('test'));
    if (testId) {
        if (!currentTest || testId != currentTest.id) {
            var request = getFullTest(testId);
            request.onsuccess = function(test) {
                currentTest = test;
                currentPage.onload?.();
            };
            request.onerror = function(event) {
                backToList();
            };
            currentState = {};
        } else {
            if (update) {
                currentPage.onupdate?.();
            } else {
                currentPage.onload?.();
            }
        }
    } else {
        backToList();
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
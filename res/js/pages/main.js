const MAIN_URL = "/WebDiakoluo/index.html"

var PAGES = {};

var currentURL = new URL(window.location)
var currentPage = new Page(null, null);
var currentPageName = null;
var currentTest = null;
var currentModal = null;
// deprecated, use in class variables instead
var currentState = {};

/* init navigation */
function initNavigation() {
    window.onpopstate = function() {
        loadPage();
    }

    const callback = function() {
        document.getElementById('loading-page').classList.add('hide');
        loadPage();
    }

    if (isTranslationsReady()) { // ensure that translations are ready
        callback();
    } else {
        onTranslationReady = callback;
    }
}

/* load a page / process the ur l*/
function loadPage() {
    currentURL = new URL(window.location);
    var page = currentURL.searchParams.get('page') || "";
    if (page && currentPage.pageName == page) {
        if (currentPage.onupdate) {
            console.debug("Update page", page);
            if (currentPage.requireTest) loadPageRequiringTest(page, true);
            else currentPage.onupdate?.();
        }
    } else {
        console.debug("Load page", page);

        currentPage.hide();
        if (currentModal) {
            hideModal(currentModal); 
            currentModal = null;
        }
        currentState = {};

        currentPage = PAGES[page.replaceAll('-', '_')] || defaultPage;
        if (currentPage.requireTest) {
            loadPageRequiringTest();
        } else {
            currentPage.onload?.();
        }
    }
}

/* load a page that require a test */
function loadPageRequiringTest(page, update = false) {
    var testId = Number(currentURL.searchParams.get('test'));
    if (testId) {
        if (testId != currentTest?.id) {
            var request = DATABASE_MANAGER.getFullTest(testId);
            request.onsuccess = function(test) {
                currentTest = test;
                currentPage.onload?.();
            };
            request.onerror = function(event) {
                backToMain();
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
        backToMain();
    }
}

/* return to the list if an error occur for example */
function backToMain(newState = false) {
    if (newState) {
        window.history.pushState({}, 'Main page', MAIN_URL);
    } else {
        window.history.replaceState({}, 'Main page', MAIN_URL);
    }
    loadPage();
}

function onkeydown(event) {
    currentPage.onkeydown?.(event);
}
document.onkeydown = onkeydown;

function onvisibilitychange(event) {
    currentPage.onvisibilitychange?.(event);
}
document.onvisibilitychange = onvisibilitychange;

DATABASE_MANAGER.setOnLoaded(initNavigation);
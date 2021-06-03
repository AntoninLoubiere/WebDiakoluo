const MAIN_URL = "/WebDiakoluo/"

var PAGES = {};

var currentURL = new URL(window.location)
var currentPage = new Page(null, null);
var currentPageName = null;
var currentTest = null;

/* init navigation */
async function initNavigation() {
    await I18N.initAsyncFunc;
    await DATABASE_MANAGER.initAsyncFunc;
    window.onpopstate = function() {
        if (Modal.currentModal && Modal.currentModal.dismiss) {
            Modal.currentModal.hide(false);
        } else {
            loadPage();
        }
    }

    SyncManager.eventTarget.addEventListener('testchange', () => {
        defaultPage.reload();
    })

    SyncManager.eventTarget.addEventListener('testupdate', event => {
        const id = event.detail.testId;
        if (id === currentTest?.id) {
            DATABASE_MANAGER.getFullTest(id).onsuccess = test => {
                currentTest = test;
                currentPage.ontestreload?.();
            }
        }
    })

    document.getElementById('loading-page').classList.add('hide');
    loadPage();
}

/* load a page / process the url*/
function loadPage() {
    currentURL = new URL(window.location);
    var page = currentURL.searchParams.get('page') || "";
    if (page && currentPage.pageName == page) {
        if (currentPage.onupdate) {
            console.debug("Update page", page);
            if (currentPage.requireTest) loadPageRequiringTest(true);
            else currentPage.onupdate?.();
        }
    } else {
        console.debug("Load page", page);

        setPage(PAGES[page.replaceAll('-', '_')] || defaultPage);
    }
}

function setPage(page) {
    if (currentPage.pageName != null) {
        currentPage.hide();
        if (Modal.currentModal && Modal.currentModal.dismiss) {
            Modal.currentModal.hide(false);
        }
    }
    
    currentPage = page;
    if (currentPage.requireTest) {
        loadPageRequiringTest();
    } else {
        currentPage.onload?.();
    }
}

/* load a page that require a test */
function loadPageRequiringTest(update = false) {
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

addEventListener("keydown", function(event) {
    currentPage.onkeydown?.(event);
}, {capture: true});

addEventListener("keydown", function(event) {
    if (event.key === 'Escape') {
        if (Modal.currentModal) {
            if (!Modal.currentModal.noDismiss) Modal.hideModal();
        }
    }
});

addEventListener("click", function(event) {
    currentPage.onclick?.(event);
}, {capture: true});

addEventListener("visibilitychange", function(event) {
    currentPage.onvisibilitychange?.(event);
}, {capture: true});

addEventListener("beforeunload", function(event) {
    currentPage.ondelete?.(); // make sure that the state is correctly
}, {capture: true});

var initNavigationFunc = initNavigation();
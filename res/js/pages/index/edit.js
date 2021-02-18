const EDIT_AUTO_SAVE_TIME = 10 * 1000;

const editPageView = document.getElementById('edit-page');

var editPageAutoSaveId;

PAGES.edit = new Page(editPageView, 'edit', false, loadEditPage, null, deleteEditPage);
PAGES.edit.onvisibilitychange = visibilityChangeEditPage;

function loadEditPage() {
    var testId = currentURL.searchParams.get('test');
    if (currentTest?.id != testId) {
        if (testId == "new") {
            currentTest = new Test(getTranslation("default-test-title"), getTranslation("defualt-test-description"));
            loadTestEditPage();
        } else if (testId == "current") {
            var request = getFullTest(EDIT_KEY);
            request.onsuccess = function(test) {
                currentTest = test;
                loadTestEditPage();
            }
            request.onerror = backToMain;
        } else {
            testId = Number(testId);
            if (testId) {
                var request = getFullTest(EDIT_KEY);
                request.onsuccess = function(test) {
                    if (testId == test.edit_id) {
                        currentTest = test;
                        loadTestEditPage();
                    } else {
                        initialiseTestEditPage(testId);
                    }
                }
                request.onerror = function() {
                    initialiseTestEditPage(testId);
                }
            } else {
                backToMain();
            }
        }
    }
}

/* create a new edit test from a test already existing */
function initialiseTestEditPage(id) {
    // TODO warning erase test
    request = getFullTest(id);
    request.onsuccess = function(test) {
        currentTest = test;
        currentTest.edit_id = id;
        currentTest.id = EDIT_KEY;
        loadTestEditPage();
    }

    request.onerror = backToMain;
}

/* when the page is deleted */
function deleteEditPage() {
    saveTestEditPage();
    clearInterval(editPageAutoSaveId);
    editPageAutoSaveId = null;
}

/* load the current test in the UI*/
function loadTestEditPage() {
    // TODO
    visibilityChangeEditPage(); // set auto save automatic
    editPageView.classList.remove('hide');

}

function visibilityChangeEditPage() {
    if (document.hidden) {
        clearInterval(editPageAutoSaveId);
        editPageAutoSaveId = null;
    } else {
        editPageAutoSaveId = setInterval(saveTestEditPage, EDIT_AUTO_SAVE_TIME);
    }
}

function saveTestEditPage() {
    console.log("Save");
}
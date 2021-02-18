const EDIT_AUTO_SAVE_TIME = 10 * 1000;

const editPageView = document.getElementById('edit-page');
const editPageTitle = document.getElementById('edit-test-title');
const editPageDescription = document.getElementById('edit-test-description');

var editPageAutoSaveId;

PAGES.edit = new Page(editPageView, 'edit', false, loadEditPage, loadEditPage, deleteEditPage);
PAGES.edit.onvisibilitychange = visibilityChangeEditPage;

function loadEditPage() {
    var testId = currentURL.searchParams.get('test');
    if (testId == "new") {
        currentTest = new Test(getTranslation("default-test-title"), getTranslation("defualt-test-description"));
        currentTest.id = EDIT_KEY;
        loadTestEditPage();
    } else if (testId == "current") {
        if (currentTest?.id == EDIT_KEY) {
            loadTestEditPage();
        } else {
            var request = getFullTest(EDIT_KEY);
            request.onsuccess = function(test) {
                currentTest = test;
                loadTestEditPage();
            }
            request.onerror = backToMain;
        }
    } else {
        testId = Number(testId);
        if (testId) {
            if (currentTest?.id == EDIT_KEY) {
                if (currentTest.edit_id == testId) {
                    loadTestEditPage();
                } else {
                    initialiseTestEditPage(testId);
                }
            } else {
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
            }
        } else {
            backToMain();
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
    if (currentTest) saveTestEditPage();
    clearInterval(editPageAutoSaveId);
    editPageAutoSaveId = null;
}

/* load the current test in the UI*/
function loadTestEditPage() {
    // TODO
    editPageTitle.value = currentTest.title;
    editPageDescription.value = currentTest.description;

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
    currentTest.title = editPageTitle.value;
    currentTest.description = editPageDescription.value;

    updateTest(currentTest);
}

function cancelButtonEditPage() {
    currentTest = null;
    deleteTest(EDIT_KEY);
    backToMain(true);
}

function saveButtonEditPage() {
    saveTestEditPage();
    if (currentTest.edit_id) {
        currentTest.id = currentTest.edit_id;
        delete currentTest.edit_id;
        updateTest(currentTest);
        deleteTest(EDIT_KEY);
        currentTest = null;
        backToMain(true);
    } else {
        delete currentTest.id;
        addNewTest(currentTest);
        deleteTest(EDIT_KEY);
        currentTest = null;
        backToMain(true);
    }
}
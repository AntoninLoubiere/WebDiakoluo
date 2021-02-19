const EDIT_AUTO_SAVE_TIME = 10 * 1000;

const editPageView = document.getElementById('edit-page');
const editPageTitle = document.getElementById('edit-test-title');
const editPageDescription = document.getElementById('edit-test-description');

const editPageColumnsList = document.getElementById('edit-test-columns');
const editPageDataTableHeader = document.getElementById('edit-test-data-header');
const editPageDataTableBody = document.getElementById('edit-test-data-body');

const editColumnModalTitle1 = document.getElementById('modal-edit-column-title1');
const editColumnModalTitle2 = document.getElementById('modal-edit-column-title2');
const editColumnModalDescription = document.getElementById('modal-edit-column-description');

const editDataModalContent = document.getElementById('edit-test-data-content');
const editDataModalId = document.getElementById('edit-test-data-id');

const editColumnTemplate = document.getElementById('edit-column-child-template');
const editDataTemplate = document.getElementById('edit-data-child-template');

var editPageAutoSaveId;

PAGES.edit = new Page(editPageView, 'edit', false, loadEditPage, updateEditPage, deleteEditPage);
PAGES.edit.onvisibilitychange = visibilityChangeEditPage;

/* When the page is loaded */
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

/* When the page is updated */
function updateEditPage() {
    if (currentTest?.id == EDIT_KEY) {
        var testId = currentURL.searchParams.get('test');
        if (testId == "new") {
            if (testId.edit_id) {
                deleteEditPage();
                loadEditPage();
            }
        } else if (testId != "current") {
            testId = Number(testId);
            if (testId != currentTest.edit_id) {
                deleteEditPage();
                loadEditPage();
            }
        }
    } else {
        deleteEditPage();
        loadEditPage();
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

/* when the visibility of the page change */
function visibilityChangeEditPage() {
    if (document.hidden) {
        saveTestEditPage();
        clearInterval(editPageAutoSaveId);
        editPageAutoSaveId = null;
    } else {
        editPageAutoSaveId = setInterval(saveTestEditPage, EDIT_AUTO_SAVE_TIME);
    }
}

/* save the edited test */
function saveTestEditPage() {
    currentTest.title = editPageTitle.value;
    currentTest.description = editPageDescription.value;

    updateTest(currentTest);
}

/* callback for the cancel button */
function cancelButtonEditPage() {
    var id = currentTest.edit_id;
    currentTest = null;
    deleteTest(EDIT_KEY);
    if (id) viewTestPage(id);
    else backToMain(true);
}

/* callback for the save button */
function saveButtonEditPage() {
    saveTestEditPage();
    currentTest.registerModificationDate();
    if (currentTest.edit_id) {
        currentTest.id = currentTest.edit_id;
        delete currentTest.edit_id;
        updateTest(currentTest).onsuccess = function(event) {
            viewTestPage(event.target.result);
        };
        deleteTest(EDIT_KEY);
        currentTest = null; // do not save on delete
    } else {
        delete currentTest.id;
        addNewTest(currentTest).onsuccess = function(event) {
            viewTestPage(event.target.result);
        };
        deleteTest(EDIT_KEY);
        currentTest = null; // do not save on delete
    }
}
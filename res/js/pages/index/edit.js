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

    removeAllChildren(editPageColumnsList);
    removeAllChildren(editPageDataTableHeader);
    removeAllChildren(editPageDataTableBody);

    visibilityChangeEditPage(); // set auto save automatic
    editPageView.classList.remove('hide');

    var row = editDataTemplate.content.cloneNode(true);
    row.querySelector('.min').innerHTML = '<x-i18n key="edit"></x-i18n>';
    editPageDataTableHeader.appendChild(row);
    for (let i = 0; i < currentTest.columns.length; i++) {
        addColumnChildEditPage(i);
    }

    for (let i = 0; i < currentTest.data.length; i++) {
        addDataChildEditPage(i);
    }

    setPageTitle(currentTest.title);
}

/* Add a column in the UI */
function addColumnChildEditPage(index) {
    var column = currentTest.columns[index];
    var e = editColumnTemplate.content.cloneNode(true);
    e.querySelector('.test-column-text').textContent = column.name;
    e.children[0].onclick = function() {
        onColumnClickEditPage(index);
    };

    editPageColumnsList.appendChild(e);

    e = document.createElement('td');
    e.textContent = column.name;
    editPageDataTableHeader.children[0].appendChild(e);
}

/* Update a column in the UI */
function updateColumnChildEditPage(index) {
    var column = currentTest.columns[index];
    var e = editPageColumnsList.children[index];
    e.querySelector('.test-column-text').textContent = column.name;

    e = editPageDataTableHeader.children[0].children[index + 1]; // +1 because of the min td in first place
    e.textContent = column.name;
}

/* reset onclick events in columns when the order is modified */
function resetColumnsClickEditPage() {
    for (let i = 0; i < currentTest.columns.length; i++) {
        editPageColumnsList.children[i].onclick = function() {
            onColumnClickEditPage(i);
        };
    }
}

/* when a column edit is click */
function onColumnClickEditPage(index) {
    console.log(index);  
}

/* Add a data in the UI */
function addDataChildEditPage(index) {
    var row = editDataTemplate.content.cloneNode(true);
    var e;
    for (var j = 0; j < currentTest.data[index].length; j++) {
        e = document.createElement('td');
        e.textContent = currentTest.columns[j].getDataValueString(currentTest.data[index][j]);
        row.children[0].appendChild(e);
    }
    row.children[0].onclick = function() {
        onDataClickEditPage(index);
    }
    editPageDataTableBody.appendChild(row);
}

/* Update a data in the UI */
function updateDataChildEditPage(index) {
    var row = editPageDataTableBody.children[index];
    var e;
    for (var j = 0; j < currentTest.data[index].length; j++) {
        e = row.children[j + 1]; // +1 because of the min td at first
        e.textContent = currentTest.columns[j].getDataValueString(currentTest.data[index][j]);
    }
}

/* when a data edit is click */
function onDataClickEditPage(index) {
    console.log(index);  
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
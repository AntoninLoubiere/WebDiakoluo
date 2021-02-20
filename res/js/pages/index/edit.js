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
PAGES.edit.onkeydown = onkeydownEditPage;

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
                return;
            }
        } else if (testId != "current") {
            testId = Number(testId);
            if (testId != currentTest.edit_id) {
                deleteEditPage();
                loadEditPage();
                return;
            }
        }
    } else {
        deleteEditPage();
        loadEditPage();
        return;
    }
    updateModalEditPage();
}

/* verify if the url show any modal */
function updateModalEditPage() {
    var p = Number(currentURL.searchParams.get('column'));
    if (p) {
        if (p > currentTest.columns.length) p = currentTest.data.length;
        if (p <= 0) p = 1;
        updateEditColumnModal(p - 1);
        return;
    }

    p = Number(currentURL.searchParams.get('data'));
    if (p) {
        if (p > currentTest.data.length) p = currentTest.data.length;
        if (p <= 0) p = 1;
        updateEditDataModal(p - 1);
        return;
    }

    if (currentModal) {
        hideModal(currentModal);
        currentModal = null;
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
    if (currentTest?.id == EDIT_KEY) saveTestEditPage(); // save only if it's a edit test
    clearInterval(editPageAutoSaveId);
    editPageAutoSaveId = null;
}

/* load the current test in the UI */
function loadTestEditPage() {
    // TODO
    editPageTitle.value = currentTest.title;
    editPageDescription.value = currentTest.description;

    removeAllChildren(editPageColumnsList);
    removeAllChildren(editPageDataTableHeader);
    removeAllChildren(editPageDataTableBody);

    visibilityChangeEditPage(); // set auto save automatic

    var row = editDataTemplate.content.cloneNode(true);
    row.querySelector('.min').innerHTML = '<x-i18n key="edit"></x-i18n>';
    editPageDataTableHeader.appendChild(row);
    for (let i = 0; i < currentTest.columns.length; i++) {
        addColumnChildEditPage(i);
    }

    for (var i = 0; i < currentTest.data.length; i++) {
        addDataChildEditPage(i);
    }

    setPageTitle(currentTest.title);
    editPageView.classList.remove('hide');
    updateModalEditPage();
}

/* Add a column in the UI */
function addColumnChildEditPage(index) {
    var column = currentTest.columns[index];
    var e = editColumnTemplate.content.cloneNode(true);
    e.querySelector('.test-column-text').textContent = column.name;
    e.children[0].onclick = function() {
        editColumnClickCallback(index);
    };
    e.querySelector('.column-close-button').onclick = function(event) {
        event.stopPropagation();
        removeColumnEditPage(index);
    }

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

/* remove a column in the list */
function removeColumnChildEditPage(index) {
    editPageColumnsList.removeChild(editPageColumnsList.children[index]);
    resetColumnsClickEditPage();
}

/* reset onclick events in columns when the order is modified */
function resetColumnsClickEditPage() {
    for (let i = 0; i < currentTest.columns.length; i++) {
        editPageColumnsList.children[i].onclick = function() {
            editColumnClickCallback(i);
        };
    }
}

/* when a column is clicked */
function editColumnClickCallback(id) {
    updateEditColumnModal(id);
    currentURL.searchParams.set('column', id + 1);
    history.pushState({}, '', currentURL);
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
        editDataClickCallback(index);
    }
    row.querySelector('.data-delete-button').onclick = function(event) {
        event.stopPropagation();
        removeDataEditPage(index);
    }
    editPageDataTableBody.appendChild(row);
}

/* Update a data in the UI */
function updateDataChildEditPage(index) {
    var row = editPageDataTableBody.children[index];
    var e;
    for (var j = 0; j < currentTest.columns.length; j++) {
        e = row.children[j + 1]; // +1 because of the min td at first
        e.textContent = currentTest.columns[j].getDataValueString(currentTest.data[index][j]);
    }
}

/* Update a data in the UI */
function removeDataChildEditPage(index) {
    editPageDataTableBody.removeChild(editPageDataTableBody.children[index]);
    resetDataClickEditPage();
}

/* reset onclick events in data when the order is modified */
function resetDataClickEditPage() {
    for (let i = 0; i < currentTest.data.length; i++) {
        editPageDataTableBody.children[i].onclick = function() {
            editDataClickCallback(i);
        };
        editPageDataTableBody.children[i].querySelector('.data-delete-button').onclick = function(event) {
            event.stopPropagation();
            removeDataEditPage(i);
        }
    }
}

/* reload the entire UI of the data set */
function reloadDataEditPage() {
    removeAllChildren(editPageDataTableHeader);
    removeAllChildren(editPageDataTableBody);

    var e;
    var row = editDataTemplate.content.cloneNode(true);
    row.querySelector('.min').innerHTML = '<x-i18n key="edit"></x-i18n>';
    for (var i = 0; i < currentTest.columns.length; i++) {
        e = document.createElement('td');
        e.textContent = currentTest.columns[i].name;
        row.children[0].appendChild(e);
    }
    editPageDataTableHeader.appendChild(row);

    for (var i = 0; i < currentTest.data.length; i++) {
        addDataChildEditPage(i);
    }
}

/* when a data is clicked */
function editDataClickCallback(id) {
    updateEditDataModal(id);
    currentURL.searchParams.set('data', id + 1);
    history.pushState({}, '', currentURL);
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

    if (currentModal == 'edit-test-column') applyEditColumnModal();
    else if (currentModal == 'edit-test-data') applyEditDataModal();

    updateTest(currentTest);
}

/* save the current data in modals */
function applyEditColumnModal() {
    console.assert(currentModal == 'edit-test-column', "The edit test modal must be column");
    var column = currentTest.columns[currentState.id];
    column.name = editColumnModalTitle2.value;
    column.description = editColumnModalDescription.value;
    updateColumnChildEditPage(currentState.id);
}

function applyEditDataModal() {
    console.assert(currentModal == 'edit-test-data', "The edit test modal must be data");
    var row = currentTest.data[currentState.id];
    for (var i = 0; i < currentTest.columns.length; i++) {
        currentTest.columns[i].setValueFromView(row[i], editDataModalContent.children[i * 2 + 1]);
    }
    updateDataChildEditPage(currentState.id);
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
    } else {
        delete currentTest.id;
        addNewTest(currentTest).onsuccess = function(event) {
            viewTestPage(event.target.result);
        };
        deleteTest(EDIT_KEY);
    }
}

/* add a column */
function addColumnEditPage() {
    var pos = currentTest.addColumn(new ColumnString(getTranslation("default-column-title")));
    addColumnChildEditPage(pos);
    updateEditColumnModal(pos);
    reloadDataEditPage();
}

/* remove a column */
function removeColumnEditPage(index) {
    currentTest.removeColumn(index);
    removeColumnChildEditPage(index);
    reloadDataEditPage();
} 

/* add a data */
function addDataEditPage() {
    var pos = currentTest.addData();
    addDataChildEditPage(pos);
    updateEditDataModal(pos);
}

/* remove a data */
function removeDataEditPage(index) {
    currentTest.removeData(index);
    removeDataChildEditPage(index);
} 

function onkeydownEditPage(event) {
    switch (event.keyCode) {
        case KeyboardEvent.DOM_VK_ESCAPE:
            if (currentModal == 'edit-test-column') {
                closeEditColumnModal();
            } else if (currentModal == 'edit-test-data') {
                closeEditDataModal();
            } else {
                backToMain();
            }
            event.preventDefault();
            break;

        case KeyboardEvent.DOM_VK_RIGHT:
            if (!event.altKey) return;
            if (currentModal == 'edit-test-column') {
                nextEditColumn();
                event.preventDefault();
            } else if (currentModal == 'edit-test-data') {
                nextEditData();
                event.preventDefault();
            }
            break;

        case KeyboardEvent.DOM_VK_LEFT:
            if (!event.altKey) return;
            if (currentModal == 'edit-test-column') {
                previousEditColumn();
                event.preventDefault();
            } else if (currentModal == 'edit-test-data') {
                previousEditData();
                event.preventDefault();
            }
            break;

        case KeyboardEvent.DOM_VK_PAGE_DOWN:
            if (!event.altKey) return;
            if (currentModal == 'edit-test-column') {
                lastEditColumn();
                event.preventDefault();
            } else if (currentModal == 'edit-test-data') {
                lastEditData();
                event.preventDefault();
            }
            break;

        case KeyboardEvent.DOM_VK_PAGE_UP:
            if (!event.altKey) return;
            if (currentModal == 'edit-test-column') {
                firstEditColumn();
                event.preventDefault();
            } else if (currentModal == 'edit-test-data') {
                firstEditData();
                event.preventDefault();
            }
            break;
    }
}

/* update the modal from an id */
function updateEditColumnModal(id) {
    if (currentModal != "edit-test-column") {
        currentModal = "edit-test-column";
        showModal(currentModal);
        currentState.id = -1;
    }
    if (currentState.id != id) {
        if (currentState.id >= 0) applyEditColumnModal();
        currentState.id = id;
        
        var column = currentTest.columns[id];
        editColumnModalTitle1.textContent = column.name;
        editColumnModalTitle2.value = column.name;
        editColumnModalDescription.value = column.description;
    }
}

/* go to the next column */
function nextEditColumn() {
    if (currentState.id < currentTest.columns.length - 1) {
        updateEditColumnModal(currentState.id + 1); // don't add to history in order to not spam the history 
    }
}

/* go to the first column */
function firstEditColumn() {
    updateEditColumnModal(0);
}

/* go to the previous column*/
function previousEditColumn() {
    if (currentState.id > 0) {
        updateEditColumnModal(currentState.id - 1);
    }
}

/* go to the last column*/
function lastEditColumn() {
    updateEditColumnModal(currentTest.columns.length - 1);
}

/* close the column modal */
function closeEditColumnModal() {
    // TODO save
    applyEditColumnModal();
    currentURL.searchParams.delete('column');
    history.pushState({}, '', currentURL);
    hideModal(currentModal);
    currentModal = null;
}

/* update the modal of data */
function updateEditDataModal(id) {
    if (currentModal != "edit-test-data") {
        currentModal = "edit-test-data";
        showModal(currentModal);
        currentState.id = -1;
    }
    if (currentState.id != id) {

        if (currentState.id >= 0) applyEditDataModal();
        currentState.id = id;

        var row = currentTest.data[id];
        editDataModalId.textContent = id + 1;
        removeAllChildren(editDataModalContent);
        var e;
        var column;
        for (var i = 0; i < row.length; i++) {
            column = currentTest.columns[i];
            e = document.createElement('h3');
            e.textContent = column.name + ":";
            e.classList = ['no-margin']
            editDataModalContent.appendChild(e);

            editDataModalContent.appendChild(column.getEditView(row[i]));
        }
    }
}

/* go to the next data*/
function nextEditData() {
    if (currentState.id < currentTest.data.length - 1) {
        updateEditDataModal(currentState.id + 1);
    }
}

/* go to the previous data */
function previousEditData() {
    if (currentState.id > 0) {
        updateEditDataModal(currentState.id - 1);
    }
}

/* go to the first data */
function firstEditData() {
    updateEditDataModal(0);
}

/* go to the last edit data */
function lastEditData() {
    updateEditDataModal(currentTest.data.length - 1);
}

/* close the data modal */
function closeEditDataModal() {
    applyEditDataModal();
    currentURL.searchParams.delete('data');
    history.pushState({}, '', currentURL);
    hideModal(currentModal);
    currentModal = null;
}
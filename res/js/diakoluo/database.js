var testDB;
var testDBEditor;

var testDBFreeIndex = null;
var testDBCallbacks = [];

/* initialize databases*/
function initalizeDB() {
    testDB = indexedDB.open('tests', 1);
    testDB.onerror = function(event) {
        console.error('Database cannot be loaded', event);
    };

    testDB.onsuccess = function(event) {
        testDBEditor = event.target.result;
        testDBEditor.onerror = function(event) {
            let e = event.target.error;
            console.error("In testDB, error n°" + e.code + " occur !\n\n" + e.name + "\n" + e.message, {e}, event);
        }

        // get the last obhect key
        testDBEditor.transaction(['header']).objectStore('header').openCursor(null, "prev").onsuccess = function(event) {
            var cursor = event.target.result;
            if (cursor) {
                testDBFreeIndex = cursor.key + 1;
            } else {
                testDBFreeIndex = 1;
            }
            console.info("Database loaded.");

            for (var i = testDBCallbacks.length - 1; i >= 0; i--) {
                testDBCallbacks[i]();
            }
        };
    }

    testDB.onupgradeneeded = function(event) {
        testDBEditor = event.target.result;

        testDBEditor.onerror = function(event) {
            console.error("Error", event);
        };

        var header = testDBEditor.createObjectStore("header", { keyPath: "id" });

        header.createIndex("title", "title", { unique: false });
        header.createIndex("description", "description", { unique: false });
        header.createIndex("playable", "playable", { unique: false });

        var tests = testDBEditor.createObjectStore("tests", { keyPath: "id" }); // same id as above.

        tests.createIndex("title", "title", { unique: false });
        tests.createIndex("description", "title", { unique: false });

        console.info("Database initialized or upgraded.");
    };

    // set storage persistent if possible, else, warn the user
    if (navigator.storage && navigator.storage.persist) {
        navigator.storage.persist().then(function(persistent) {
            // TODO: improve and create a new dialog
            if (!persistent) {
                loadModal('persist-storage-c-warning');
            }
        });
    } else {
        if (localStorage.getItem('modal-persist-c-storage') != "true") {
            loadModal('persist-storage-c-warning');
        }
    }
}

/* add a new test*/
function addNewTest(test) {
    if (testDBFreeIndex == null) {
        console.error("DB not initialized !");
        return;
    }
    test.id = testDBFreeIndex;
    testDBFreeIndex++;
    var transaction = testDBEditor.transaction(['header', 'tests'], "readwrite");
    var header = transaction.objectStore('header');
    var tests = transaction.objectStore('tests');

    var request = header.add(test.getHeader());
    var request = tests.add(test);
    request.onsuccess = function(event) {
    }
}

/* update a test */
function updateTest(test) {
    if (testDBFreeIndex == null) {
        console.error("DB not initialized !");
        return;
    }
    var transaction = testDBEditor.transaction(['header', 'tests'], "readwrite");
    var header = transaction.objectStore('header');
    var tests = transaction.objectStore('tests');

    var request = header.put(test.getHeader());
    var request = tests.put(test);
    request.onsuccess = function(event) {
    }
}

/* delete a test */
function deleteTest(id) {
    if (testDBFreeIndex == null) {
        console.error("DB not initialized !");
        return;
    }
    var transaction = testDBEditor.transaction(['header', 'tests'], "readwrite");
    var header = transaction.objectStore('header');
    var tests = transaction.objectStore('tests');

    var request = header.delete(id);
    var request = tests.delete(id);
    request.onsuccess = function(event) {
    }
}

/* get a full test data*/
function getFullTest(id) {
    if (testDBFreeIndex == null) {
        console.error("DB not initialized !");
        return;
    }
    var transaction = testDBEditor.transaction(['tests'], "readonly");
    var tests = transaction.objectStore(['tests']);
    var r = tests.get(id);
    var o = {onsuccess: null, onerror: null};
    r.onsuccess = function(event) {
        var test = event.target.result;
        if (test) {
            try {
                test = Test.cast(test);  
            } catch(e) {
                console.error("Error while casting the test !", e);
                if (o.onerror) o.onerror(event);
                return;
            }
            if (o.onsuccess) o.onsuccess(test);
        } else {
            if (o.onerror) o.onerror(event);
            
        }
    }

    r.onerror = function() {
        if (o.onerror) o.onerror(event);
        else indexedDB.onerror(event);
    }

    return o;
}

/* get the cursor to get all childs */
function forEachHeader() {
    if (testDBFreeIndex == null) {
        console.error("DB not initialized !");
        return;
    }
    return testDBEditor.transaction(['header']).objectStore('header').openCursor();
}

setTimeout(initalizeDB, 0);
const EDIT_KEY = "edit";

/* the manager of the database */
class DatabaseManager {
    constructor() {
        this.testDB = null;
        this.testDBEditor = null;

        this.freeIndex = null;
        this.onloadedcallback = null;
    }

    /* initialise the db */
    initialise() {
        this.testDB = indexedDB.open('tests', 1);
        this.testDB.onerror = function(event) {
            console.error('Database cannot be loaded', event);
        };

        this.testDB.onsuccess = event => {
            this.testDBEditor = event.target.result;
            this.testDBEditor.onerror = this.onTestDBError;

            // get the last obhect key
            this.testDBEditor.transaction(['header']).objectStore('header').openCursor(null, "prev").onsuccess = event => {
                var cursor = event.target.result;
                if (cursor) {
                    if (cursor.key == EDIT_KEY) {
                        cursor.continue();
                        return;
                    }
                    this.freeIndex = cursor.key + 1;
                } else {
                    this.freeIndex = 1;
                }
                console.info("Database loaded.");
                this.onloaded();
            };
        }

        this.testDB.onupgradeneeded = event => {
            this.testDBEditor = event.target.result;

            this.testDBEditor.onerror = this.onTestDBError;

            switch (this.testDBEditor.version) {
                case 1:
                    var header = this.testDBEditor.createObjectStore("header", { keyPath: "id" });

                    header.createIndex("title", "title", { unique: false });
                    header.createIndex("description", "description", { unique: false });
                    header.createIndex("playable", "playable", { unique: false });

                    var tests = this.testDBEditor.createObjectStore("tests", { keyPath: "id" }); // same id as above.

                    tests.createIndex("title", "title", { unique: false });
                    tests.createIndex("description", "title", { unique: false });

            }
            console.info("Database initialised or upgraded from version", this.onTestDBError?.version);
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

    /* callback when an error occur on the database */
    onError(event) {
        let e = event.target.error;
        console.error("In testDB, error n°" + e.code + " occur !\n\n" + e.name + "\n" + e.message, {e}, event);
    }

    /* add a new test */
    addNewTest(test) {
        if (this.freeIndex == null) {
            console.error("DB not initialised !");
            return;
        }
        if (!test.id) {
            test.id = this.freeIndex;
            this.freeIndex++;
        }
        var transaction = this.testDBEditor.transaction(['header', 'tests'], "readwrite");
        var header = transaction.objectStore('header');
        var tests = transaction.objectStore('tests');

        header.add(test.getHeader());
        return tests.add(test);
    }

    /* update a test */
    updateTest(test) {
        if (this.freeIndex == null) {
            console.error("DB not initialised !");
            return;
        }
        var transaction = this.testDBEditor.transaction(['header', 'tests'], "readwrite");
        var header = transaction.objectStore('header');
        var tests = transaction.objectStore('tests');

        header.put(test.getHeader());
        return tests.put(test);
    }

    /* delete a test */
    deleteTest(id) {
        if (this.freeIndex == null) {
            console.error("DB not initialised !");
            return;
        }
        var transaction = this.testDBEditor.transaction(['header', 'tests'], "readwrite");
        var header = transaction.objectStore('header');
        var tests = transaction.objectStore('tests');

        header.delete(id);
        return tests.delete(id);
    }

    /* get a full test data*/
    getFullTest(id) {
        if (this.freeIndex == null) {
            console.error("DB not initialised !");
            return;
        }
        var transaction = this.testDBEditor.transaction(['tests'], "readonly");
        var tests = transaction.objectStore(['tests']);
        var r = tests.get(id);
        var o = {onsuccess: null, onerror: null};
        r.onsuccess = event => {
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

        r.onerror = () => {
            if (o.onerror) o.onerror(event);
            else indexedDB.onerror(event);
        }

        return o;
    }

    /* get the cursor to get all childs */
    forEachHeader() {
        if (this.freeIndex == null) {
            console.error("DB not initialised !");
            return;
        }
        return this.testDBEditor.transaction(['header']).objectStore('header').openCursor();
    }
    /* set the on loaded callback */
    setOnLoaded(c) {
        if (this.freeIndex == null) {
            this.onloadedcallback = c;
        } else {
            c();
        }
    }

    onloaded() {
        this.onloadedcallback?.();
    }
}

const DATABASE_MANAGER = new DatabaseManager();
DATABASE_MANAGER.initialise();
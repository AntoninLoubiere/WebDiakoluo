const EDIT_KEY = "edit";
const DATABASE_VERSION = 3;

/* the manager of the database */
class DatabaseManager {
    constructor() {
        this.testDB = null;
        this.testDBEditor = null;

        this.freeIndex = null;

        this.initAsyncFunc = this.initialise();
    }

    /* initialise the db */
    async initialise() {
        return new Promise((resolve, reject) => {
            this.testDB = indexedDB.open('tests', DATABASE_VERSION);
            this.testDB.onerror = function(event) {
                console.error('Database cannot be loaded', event);
                reject();
            };

            this.testDB.onsuccess = event => {
                this.testDBEditor = event.target.result;
                this.testDBEditor.onerror = this.onTestDBError;

                // get the last object key
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
                    console.info("Database loaded. Version", DATABASE_VERSION);
                    resolve();
                };
            }

            this.testDB.onupgradeneeded = event => {
                this.testDBEditor = event.target.result;

                this.testDBEditor.onerror = this.onTestDBError;



                switch (event.oldVersion) {
                    default:
                        var header = this.testDBEditor.createObjectStore("header", { keyPath: "id" });

                        header.createIndex("title", "title", { unique: false });
                        header.createIndex("description", "description", { unique: false });
                        header.createIndex("playable", "playable", { unique: false });

                        var tests = this.testDBEditor.createObjectStore("tests", { keyPath: "id" }); // same id as above.

                        tests.createIndex("title", "title", { unique: false });
                        tests.createIndex("description", "title", { unique: false });

                    case 1:
                        var playContexts = this.testDBEditor.createObjectStore("playContexts", 
                        { 
                            autoIncrement: true, 
                            keyPath: "pk"
                        });
                        playContexts.createIndex("testId", "testId");
                        playContexts.createIndex("gameId", "gameId");
                        playContexts.createIndex("testContext", ["testId", "gameId"], { unique: true });

                    case 2:
                        var sharedTests = this.testDBEditor.createObjectStore(
                            "sharedTests", 
                            { autoIncrement: true, keyPath: "pk" }
                        );
                        sharedTests.createIndex("authAccount", "authAccount");
                        sharedTests.createIndex("testId", "testId");
                        sharedTests.createIndex("serverTestId", "serverTestId");
                        sharedTests.createIndex("lastModification", "lastModification");

                }
                console.info("Database initialised or upgraded from version", event.oldVersion, "to", DATABASE_VERSION);
            };

            // set storage persistent if possible, else, warn the user
            if (navigator.storage && navigator.storage.persist) {
                navigator.storage.persist().then(function(persistent) {
                    if (!persistent) {
                        I18N.initAsyncFunc.then(() => Modal.showOkModal(
                            'error-storage-p-title', 
                            'error-storage-p-message', 
                            {important: true, showAgain: 'modal-persist-p-storage'}
                        ));
                    }
                });
            } else {
                I18N.initAsyncFunc.then(() => Modal.showOkModal(
                    'error-storage-c-title', 
                    'error-storage-c-message', 
                    {important: true, showAgain: 'modal-persist-c-storage'}
                ));
            }
        });
    }

    /* callback when an error occur on the database */
    onError(event) {
        let e = event.target.error;
        console.error("In testDB, error n°" + e.code + " occur !\n\n" + e.name + "\n" + e.message, {e}, event);
    }

    /* add a new test */
    addNewTest(test) {
        test.id = this.freeIndex;
        this.freeIndex++;
        var transaction = this.testDBEditor.transaction(['header', 'tests'], "readwrite");
        var header = transaction.objectStore('header');
        var tests = transaction.objectStore('tests');

        header.add(test.getHeader());
        return tests.add(test);
    }

    /* add a play context */
    addPlayContext(context, pageConstructor) {
        context.gameId = pageConstructor.DB_GAME_ID;

        this.testDBEditor
            .transaction(['playContexts'], 'readwrite')
            .objectStore('playContexts')
            .add(context)
            .onsuccess = function(event) {
                context.pk = event.target.result; // set the pk found
            };
    }

    /* update a test */
    updateTest(test) {
        var transaction = this.testDBEditor.transaction(['header', 'tests'], "readwrite");
        var header = transaction.objectStore('header');
        var tests = transaction.objectStore('tests');

        header.put(test.getHeader());
        return tests.put(test);
    }

    /* update the play context */
    updatePlayContext(context) {
        var playContexts = this.testDBEditor.transaction(['playContexts'], 'readwrite').objectStore('playContexts');
        return playContexts.put(context);
    }

    /* delete a test */
    deleteTest(id) {
        var transaction = this.testDBEditor.transaction(['header', 'tests'], "readwrite");
        var header = transaction.objectStore('header');
        var tests = transaction.objectStore('tests');

        this.deleteAllPlayContext(id);

        header.delete(id);
        return tests.delete(id);
    }

    /* delete all play context of a specific test */
    deleteAllPlayContext(testId) {
        var transaction = this.testDBEditor.transaction(['playContexts'], "readwrite");
        var playContextsIndex = transaction.objectStore('playContexts').index('testId');

        playContextsIndex.openCursor(IDBKeyRange.only(testId)).onsuccess = function(event) {
            var cursor = event.target.result;
            if (cursor) {
                cursor.delete();
                cursor.continue();
            }
        }
    }

    /* get if a test exist */
    testExist(id) {
        return new Promise((resolve, reject) => {
            var transaction = this.testDBEditor.transaction(['header'], "readonly");
            var tests = transaction.objectStore(['header']);
            var r = tests.get(id);
            r.onsuccess = () => {
                if (r.result) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }

            r.onerror = reject;
        });
    }

    /* get if a test is playable */
    getPlayable(id) {
        return new Promise((resolve, reject) => {
            var transaction = this.testDBEditor.transaction(['header'], "readonly");
            var tests = transaction.objectStore(['header']);
            var r = tests.get(id);
            r.onsuccess = event => {
                if (r.result) {
                    resolve(r.result.playable);
                } else {
                    reject(event);
                }
            }

            r.onerror = reject;
        });
    }

    /**
     * Get the header of a test.
     * @param {number} id the id of the test
     * @returns A promise that return the header of a test
     */
    getHeader(id) {
        return new Promise((resolve, reject) => {
            var transaction = this.testDBEditor.transaction(['header'], "readonly");
            var tests = transaction.objectStore(['header']);
            var r = tests.get(id);
            r.onsuccess = event => {
                if (r.result) {
                    resolve(r.result);
                } else {
                    reject(event);
                }
            }

            r.onerror = reject;
        });
    }

    /* get a full test data*/
    getFullTest(id) {
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

    /* get a play context */
    getPlayContext(testId, pageConstructor) {
        return this.testDBEditor
            .transaction(['playContexts'], 'readonly')
            .objectStore('playContexts')
            .index('testContext')
            .openCursor(
                IDBKeyRange.only([testId, pageConstructor.DB_GAME_ID])
            );
    }

    /* get the cursor to get all children */
    forEachHeader() {
        return this.testDBEditor.transaction(['header']).objectStore('header').openCursor();
    }

    /* get the cursor to get all children (except edit) */
    forEach(callback) {
        this.testDBEditor.transaction(['tests']).objectStore('tests').openCursor().onsuccess = event => {
            var cursor = event.target.result;
            if (cursor) {
                var id = cursor.value.id;
                if (id != EDIT_KEY) {
                    try {
                        var test = Test.cast(cursor.value);
                    } catch(e) {
                        console.error("Error while casting the test !", e);
                        cursor.continue();
                        return;
                    }
                    callback(test);
                }
                cursor.continue();
            } else {
                callback();
            }
        };
    }

    /**
     * Add a sync test.
     * @param {*} syncObject the sync object to add
     * @returns a promise
     */
     addSync(syncObject) {
        return new Promise((resolve, reject) => {
            var transaction = this.testDBEditor.transaction(['sharedTests'], "readwrite");
            var sharedTests = transaction.objectStore('sharedTests');
            var request = sharedTests.add(syncObject);
            request.onsuccess = resolve;
            request.onerror = reject;
        });
    }

    /**
     * Get a sync test.
     * @param {number} pk the primary key
     * @returns a promise
     */
     getSync(pk) {
        return new Promise((resolve, reject) => {
            var transaction = this.testDBEditor.transaction(['sharedTests'], "readonly");
            var sharedTests = transaction.objectStore('sharedTests');
            var request = sharedTests.get(pk);
            request.onsuccess = resolve;
            request.onerror = reject;
        });
    }

    /**
     * Update a sync test.
     * @param {*} syncObject the sync object to update
     * @returns a promise
     */
     updateSync(syncObject) {
        return new Promise((resolve, reject) => {
            var transaction = this.testDBEditor.transaction(['sharedTests'], "readwrite");
            var sharedTests = transaction.objectStore('sharedTests');
            var request = sharedTests.put(syncObject);
            request.onsuccess = resolve;
            request.onerror = reject;
        });
    }

    /**
     * Delete a synchronise test.
     * @param {number} pk the primary key of the object to delete
     */
    deleteSync(pk) {
        return new Promise((resolve, reject) => {
            var transaction = this.testDBEditor.transaction(['sharedTests'], "readwrite");
            var sharedTests = transaction.objectStore('sharedTests');
            var request = sharedTests.delete(pk);
            request.onsuccess = resolve;
            request.onerror = reject;
        });
    }

    /**
     * For each share
     * @returns the cursor opened
     */
    forEachSync(authAccount) {
        return this.testDBEditor
            .transaction(['sharedTests'], 'readwrite')
            .objectStore('sharedTests')
            .index('authAccount')
            .openCursor(IDBKeyRange.only(authAccount));
    }
}

const DATABASE_MANAGER = new DatabaseManager();

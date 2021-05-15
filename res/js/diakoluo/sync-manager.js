class SyncManager {
    static UPDATE_DELAY = 10000;

    static initialise() {
        this.syncManager = new SyncManager(JSON.parse(localStorage.getItem('sync-account')));
        this.lastUpdate = -1;
        document.addEventListener('visibilitychange', this.onVisibilityChange.bind(this));
        this.onVisibilityChange();
    }

    static setSyncAccount(data) {
        localStorage.setItem('sync-account', JSON.stringify(data));
        this.syncManager = new SyncManager(data);
    }

    static onVisibilityChange() {
        if (document.hidden) {
            clearInterval(this.updateInterval);
            this.updateInterval = -1;
        } else {
            var timeRemaining = this.lastUpdate - Date.now() + this.UPDATE_DELAY
            if (timeRemaining < 0) {
                this.updateInterval = setInterval(this.update.bind(this), this.UPDATE_DELAY);
                this.update();
            } else {
                this.updateInterval = setTimeout(() => {
                    this.updateInterval = setInterval(this.update.bind(this), this.UPDATE_DELAY);
                    this.update();
                }, timeRemaining);
            }
        }
    }

    static update() {
        this.lastUpdate = Date.now();
        this.syncManager.update().catch(error => {
            console.warn("[SYNC] An error occur while synchronising clients (update)", error);
        });
    }

    constructor(syncAccount) {
        this.username = syncAccount.username;
        this.password = syncAccount.password;
        this.host = syncAccount.host;
    }

    getPath(root) {
        return this.host + root;
    }

    login() {
        return new Promise((resolve, reject) => {
            fetch(this.getPath('/login'), {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: this.username,
                    password: this.password
                })
            }).then(response => {
                if (response.ok) {
                    resolve({error: false, code: response.status});
                    console.info('[SYNC]', 'Authenticated');
                } else if (response.status === 401) {
                    reject({error: false, code: response.status});
                    console.info('[SYNC]', 'Authentication failed');
                } else {
                    reject({error: true, code: response.status});
                    console.warn('[SYNC]', "Can't authenticate !", response);
                }
            }).catch(error => {
                console.warn('[SYNC]', "Can't authenticate !", error);
                reject({error: true});
            });
        });
    }

    authFetch(path, method='GET', body=null, tryAuth=true) {
        return new Promise((resolve, reject) => {
            fetch(this.getPath(path), {
                method: method,
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: method === 'POST' ? JSON.parse(body) : null,
            }).then(response => {
                if (response.ok) {
                    resolve(response);
                } else if (response.status === 401) {
                    if (tryAuth) {
                        this.login().then(() => this.authFetch(path, method, body, false).then(resolve).catch(reject))
                                 .catch(() => reject({code: 401}));
                    } else {
                        reject({code: 401});
                    }
                } else {
                    reject({code: response.status});
                }
            }).catch(error => {
                reject({authenticated: false, error: true});
            });
        });
    }

    authFetchJson(path, method='GET', body=null) {
        return new Promise((resolve, reject) => {
            this.authFetch(path, method, body).then(
                response => {
                    response.json()
                    .then(resolve)
                    .catch(() => reject({code: response.code}))
                }
            )
        });
    }

    async update() {
        var testsData = await this.authFetchJson('/test');
        var tests = {};
        var testsKey = [];
        for (let i = 0; i < testsData.you.length; i++) {
            const test = testsData.you[i];
            if (testsKey.indexOf(test.id) < 0) {
                tests[test.id] = {
                    last_modification: test.last_modification,
                    shareMode: [{type: 'owner'}]
                };
                testsKey.push(test.id);
            } else {
                tests[test.id].shareMode.push({type: 'owner'});
            }
        }
        for (let i = 0; i < testsData.users.length; i++) {
            const test = testsData.users[i];
            if (testsKey.indexOf(test.id) < 0) {
                tests[test.id] = {
                    last_modification: test.last_modification,
                    shareMode: [{type: 'user', username: test.username, name: test.name}]
                };
                testsKey.push(test.id);
            } else {
                tests[test.id].shareMode.push({type: 'user', username: test.username, name: test.name});
            }
        }
        for (let i = 0; i < testsData.groups.length; i++) {
            const test = testsData.groups[i];
            if (testsKey.indexOf(test.id) < 0) {
                tests[test.id] = {
                    last_modification: test.last_modification,
                    shareMode: [{type: 'group', name: test.name, long_name: test.long_name}]
                };
                testsKey.push(test.id);
            } else {
                tests[test.id].shareMode.push({type: 'group', name: test.name, long_name: test.long_name});
            }
        }

        DATABASE_MANAGER.forEachSync().onsuccess = async event => {
            var cursor = event.target.result;
            if (cursor) {
                const sync = cursor.value;
                const index = testsKey.indexOf(sync.serverTestId);
                if (index >= 0) {
                    const testHeader = tests[sync.serverTestId];
                    if (testHeader.last_modification > sync.lastModification) {
                        this.updateTest(sync, testHeader);
                    }
                    testsKey.splice(index, 1);
                } else {
                    if (sync.lastModification > 0 && sync.shareMode[0].type !== 'link') {
                        cursor.delete();
                        if (sync.testId >= 0) {
                            DATABASE_MANAGER.deleteTest(sync.testId); // TODO
                        }
                    }
                }
                cursor.continue();
            } else {
                for (let index = 0; index < testsKey.length; index++) {
                    const key = testsKey[index];
                    var sync = {testId: -1, lastModification: 0, serverTestId: key, shareMode: tests[key].shareMode};
                    DATABASE_MANAGER.addSync(sync);
                }
            }
        }
    }

    async updateTest(sync, testHeader) {
        var testData = await this.authFetchJson(`/test/${sync.serverTestId}?last_modification=${sync.lastModification}`);
        var test = Test.import(testData);
        if (test) {
            sync.lastModification = testHeader.last_modification;
            if (sync.testId > 0) {
                test.id = sync.testId;
                DATABASE_MANAGER.updateTest(test);
                DATABASE_MANAGER.updateSync(sync);
            } else {
                DATABASE_MANAGER.addNewTest(test).onsuccess = event => {
                    sync.testId = event.target.result;
                    DATABASE_MANAGER.updateSync(sync);
                }
            }
        }
    }
}
SyncManager.initialise();

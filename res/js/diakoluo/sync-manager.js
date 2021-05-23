class SyncManager {
    static UPDATE_DELAY = 600_000; // 10 minutes
    static MIN_CACHE = 300_000; // 5 minutes 
    static RELOAD_MAX_TIME = 5_000; // 5 seconds

    static initialise() {
        var d = this.deserializeData(localStorage.getItem('sync-account'));
        if (d) this.syncManager = new SyncManager(d);
        this.lastUpdate = 0;
        document.addEventListener('visibilitychange', this.onVisibilityChange.bind(this));
        this.onVisibilityChange();
    }

    static setSyncAccount(syncManager) {
        this.syncManager = null;
        this.onVisibilityChange();
        localStorage.setItem('sync-account', JSON.stringify(syncManager));
        this.syncManager = syncManager;
        this.onVisibilityChange();
    }

    static onVisibilityChange() {
        if (document.hidden || !this.syncManager) {
            if (this.updateInterval) clearInterval(this.updateInterval);
            this.updateInterval = 0;
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
        this.syncManager?.update().catch(error => {
            console.warn("[SYNC] An error occur while synchronising clients (update)", error);
        });
    }

    static deserializeData(data) {
        data = JSON.parse(data);
        if (data && typeof data.username === "string" && typeof data.password === "string" && data.host) {
            return data;
        } else {
            return null;
        }
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
                body: method === 'POST' ? JSON.stringify(body) : null,
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
            ).catch(e => reject(e))
        });
    }

    async update() {
        return new Promise(async (resolve, reject) => {
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
    
            var updates = [];
    
            var request = DATABASE_MANAGER.forEachSync();
            request.onsuccess = async event => {
                var cursor = event.target.result;
                if (cursor) {
                    const sync = cursor.value;
                    const index = testsKey.indexOf(sync.serverTestId);
                    if (index >= 0) {
                        const testHeader = tests[sync.serverTestId];
                        if (this.isShareModeNotEquals(sync.shareMode, testHeader.shareMode)) {
                            sync.shareMode = testHeader.shareMode;
                            DATABASE_MANAGER.updateSync(sync);
                        }
    
                        if (testHeader.last_modification > sync.lastModification) {
                            updates.push(this.updateTest(sync, testHeader));
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
                    for (var index = 0; index < testsKey.length; index++) {
                        const key = testsKey[index];
                        const testHeader = tests[key];
                        let sync = {testId: -1, lastModification: 0, serverTestId: key, shareMode: testHeader.shareMode};
                        DATABASE_MANAGER.addSync(sync).then((event) => {
                            sync.pk = event.target.result;
                            updates.push(this.updateTest(sync, testHeader));
                        });
                    }
    
                    Promise.all(updates).then(resolve);
                }
            }
            request.onerror = reject;
        });
    }

    isShareModeNotEquals(object1, object2) {
        if (object1.length !== object2.length) return true;
        for (var i = 0; i < object1.length; i++) {
            const o1 = object1[i];
            const o2 = object2[i];
            if (o1.type === 'link') {
                if (o2.type !== 'link') return true;
            } else if (o2.type === 'user') {
                if (o2.type !== 'user' || o1.username !== o2.username || o1.name !== o2.name) return true;
            } else if (o2.type === 'group') {
                if (o2.type !== 'group' || o1.name !== o2.name || o1.long_name !== o2.long_name) return true;
            }
        }
        return false
    }

    async updateTest(sync, testHeader) {
        var testData = await this.authFetchJson(`/test/${sync.serverTestId}?last_modification=${sync.lastModification}`);
        var test = Test.import(testData);
        if (test) {
            sync.lastModification = testHeader.last_modification;
            test.sync = sync.pk;
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

    async saveTest(test) {
        if (test.sync >= 0) {
            const event = await DATABASE_MANAGER.getSync(test.sync);
            const sync = event.target.result;
            await this.authFetch(`/test/${sync.serverTestId}`, 'POST', {
                "last-modification": sync.lastModification,
                modified: test.lastModificationDate.getTime(),
                override: true, // TODO
                test: test.getSafeTest()
            });
            await this.update();
        } else {
            await this.authFetch(`/test/new`, 'POST', {
                "last-modification": 1,
                modified: test.lastModificationDate.getTime(),
                override: true, // TODO
                test: test.getSafeTest()
            });
            await this.update();
        }
    }

    async deleteTest(test) {
        const event = await DATABASE_MANAGER.getSync(test.sync);
        const sync = event.target.result;
        await this.authFetch(`/test/${sync.serverTestId}`, 'DELETE');
        await this.update();
    }

    async getTestInfo(test) {
        const now = Date.now();
        if (now - test.syncData?.info?.lastRequest < SyncManager.MIN_CACHE && 
            document.timeline.currentTime > SyncManager.RELOAD_MAX_TIME) {
                return test.syncData.info;
        } else {
            const event = await DATABASE_MANAGER.getSync(test.sync);
            const sync = event.target.result;
            try {
                var data = await this.authFetchJson(`/test/${sync.serverTestId}/info`);
            } catch {
                if (test.syncData?.info) {
                    return test.syncData.info;
                } else {
                    throw new Error("Cannot load the informations about the test");
                }
            }
            data.serverTestId = sync.serverTestId;
            data.lastRequest = now;
            if (!test.syncData) test.syncData = {};
            test.syncData.info = data;
            DATABASE_MANAGER.updateTest(test);
            return data;
        }
    }

    async getTestShare(test) {
        const now = Date.now();
        if (now - test.syncData?.share?.lastRequest < SyncManager.MIN_CACHE && 
            document.timeline.currentTime > SyncManager.RELOAD_MAX_TIME) {
                return test.syncData.share;
        } else {
            const event = await DATABASE_MANAGER.getSync(test.sync);
            const sync = event.target.result;
            try {
                var data = await this.authFetchJson(`/test/${sync.serverTestId}/share`);
            } catch (e) {
                if (test.syncData?.share) {
                    return test.syncData.share;
                } else {
                    throw new Error("Cannot load the shares about the test");
                }
            }
            data.lastRequest = now;
            if (!test.syncData) test.syncData = {};
            test.syncData.share = data;
            DATABASE_MANAGER.updateTest(test);
            return data;
        }
    }
}
DATABASE_MANAGER.initAsyncFunc.then(SyncManager.initialise.bind(SyncManager));

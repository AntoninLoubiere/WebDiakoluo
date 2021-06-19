const syncManagerSyncIcon = document.getElementById('nav-sync');

class SyncManager {
    static UPDATE_DELAY = 600_000; // 10 minutes
    static MIN_CACHE = 300_000; // 5 minutes 
    static RELOAD_MAX_TIME = 5_000; // 5 seconds
    static MIN_SYNC_TIME = 4_100; // 4 seconds

    static PERMS = ['none', 'view', 'edit', 'share', 'owner'];

    static initialise() {
        this.eventTarget = new EventTarget();
        this.testChangedEvent = new Event('testchange');
        this.testChanged = false;

        this.syncError = false;

        var accounts = this.deserializeData(localStorage.getItem('sync-account'));
        if (accounts.length > 0) {
            syncManagerSyncIcon.classList.remove('hide');
            this.updateSyncAccount(accounts);
            this.update();
        } else {
            this.fetchManager = []
            syncManagerSyncIcon.classList.add('hide');
        }
        this.lastUpdate = 0;
        document.addEventListener('visibilitychange', this.onVisibilityChange.bind(this));
        window.addEventListener('online', this.onOnlineChange.bind(this));
        window.addEventListener('offline', this.onOnlineChange.bind(this));
        syncManagerSyncIcon.onclick = this.update.bind(this);
        this.onVisibilityChange();
    }

    static updateSyncAccount(accounts) {
        this.fetchManager = []
        for (let index = 0; index < accounts.length; index++) {
            const account = accounts[index];
            this.fetchManager.push(new SyncFetchManager(account.host, account.credentials, index));
        }
    }

    static setSyncAccount(accounts) {
        var fetchManager = this.fetchManager[0];
        if (fetchManager) {
            fetchManager.authFetch('/logout');
            DATABASE_MANAGER.forEachSync(fetchManager.authId).onsuccess = event => {
                var cursor = event.target.result;
                if (cursor) {
                    const sync = cursor.value;
                    cursor.delete();
                    if (sync.testId >= 0) {
                        DATABASE_MANAGER.deleteTest(sync.testId); // TODO
                    }
                    cursor.continue();
                } else {
                    this.eventTarget.dispatchEvent(this.testChangedEvent);
                }
            }
        }

        this.updateSyncAccount(accounts);
        localStorage.setItem('sync-account', JSON.stringify(accounts));
        if (this.fetchManager.length > 0) {
            syncManagerSyncIcon.classList.remove('hide');
        } else {
            syncManagerSyncIcon.classList.add('hide');
        }
        this.onVisibilityChange();
    }

    static onVisibilityChange() {
        if ((document.hidden && navigator.onLine) || !this.syncManager) {
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

    static onOnlineChange() {
        this.onVisibilityChange();
        
        if (navigator.onLine) {
            syncManagerSyncIcon.classList.remove('nav-no-sync');
        } else {
            syncManagerSyncIcon.classList.add('nav-no-sync');
        }
    }

    static setSyncError(error) {
        if (error !== this.syncError) {
            this.syncError = error;
            if (error) {
                syncManagerSyncIcon.classList.add('nav-sync-error');
            } else {
                syncManagerSyncIcon.classList.remove('nav-sync-error');
            }
        }
    } 

    static async update() {
        this.lastUpdate = Date.now();
        syncManagerSyncIcon.classList.add('nav-syncing');
        
        for (var i = 0; i < this.fetchManager.length; i++) {
            var m = this.fetchManager[i];
            await m.update().then(() => {
                if (this.testChanged) {
                    this.testChanged = false;
                    this.eventTarget.dispatchEvent(this.testChangedEvent);   
                }
            }).catch(error => {
                console.warn("[SYNC] An error occur while synchronising clients (update)", error);
            });
        }
        var remaining = this.lastUpdate + this.MIN_SYNC_TIME - Date.now();
        if (remaining > 0) {
            setTimeout(() => syncManagerSyncIcon.classList.remove('nav-syncing'), remaining);
        } else {
            syncManagerSyncIcon.classList.remove('nav-syncing');
        }
    }

    static deserializeData(data) {
        data = JSON.parse(data);
        if (Array.isArray(data)) {
            var result = [];
            for (let index = 0; index < data.length; index++) {
                const element = data[index];
                if (element.credentials && typeof element.credentials.username === "string" && 
                typeof element.credentials.password === "string" && element.host) {
                    result.push(element);
                }
            }
            return result;
        } else {
            if (data && typeof data.username === "string" && typeof data.password === "string" && data.host) {
                DATABASE_MANAGER.forEachSync().onsuccess = event => {
                    var cursor = event.target.result;
                    if (cursor) {
                        const sync = cursor.value;
                        if (sync.authAccount == undefined) {
                            cursor.delete();
                            if (sync.testId >= 0) {
                                DATABASE_MANAGER.deleteTest(sync.testId); // TODO
                            }
                        }
                        cursor.continue();
                    } else {
                        this.eventTarget.dispatchEvent(this.testChangedEvent);
                        this.setSyncAccount([{host: data.host, credentials: {username: data.username, password: data.password}}]);
                    }
                }
                return [{host: data.host, credentials: {username: data.username, password: data.password}}];
            } else {
                return [];
            }
        }
    }

    static isShareModeNotEquals(object1, object2) {
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

    static async getSyncFromTest(test) {
        const event = await DATABASE_MANAGER.getSync(test.sync);
        const sync = event.target.result;
        if (!sync) return null;
        if (sync.authAccount) {
            return new Sync(sync, SyncManager.fetchManager[sync.authAccount]);
        } else if (sync.host) {
            return new Sync(sync, new SyncFetchManager(sync.host, sync.credentials, null));
        } else {
            sync.authAccount = 0;
            DATABASE_MANAGER.updateSync(sync);
            return new Sync(sync, SyncManager.fetchManager[0]);
        }
    }

    static getSyncFromSync(sync, fetchManager) {
        return new Sync(sync, fetchManager);
    }
}

class SyncFetchManager {
    constructor(host, credentials, authId) {
        this.host = host;
        this.credentials = credentials;
        this.authId = authId;
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
                    username: this.credentials?.username,
                    password: this.credentials?.password
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
                    if (tryAuth && this.credentials) {
                        this.login().then(() => this.authFetch(path, method, body, false).then(resolve).catch(reject))
                                 .catch(() => reject({code: 401}));
                    } else {
                        reject({code: 401});
                    }
                } else {
                    reject({code: response.status});
                }
            }).catch(() => {
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

    async getUsers() {
        if (this.users) {
            return this.users;
        } else {
            const r = (await this.authFetchJson(`/users`)).users;
            this.users = {};

            for (var i = 0; i < r.length; i++) {
                this.users[r[i].username] = r[i].name;
            }
            return this.users;
        }
    }

    async getGroups() {
        if (this.groups) {
            return this.groups;
        } else {
            const r = (await this.authFetchJson(`/groups`)).groups;
            this.groups = {};

            for (var i = 0; i < r.length; i++) {
                this.groups[r[i].name] = r[i].long_name;
            }
            return this.groups;
        }
    }

    async update() {
        return new Promise(async (resolve, reject) => {
            try {
                var testsData = await this.authFetchJson('/test');
            } catch (e) {
                SyncManager.setSyncError(true);
                reject(e);
                return;
            }
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
    
            var request = DATABASE_MANAGER.forEachSync(this.authId);
            request.onsuccess = async event => {
                var cursor = event.target.result;
                if (cursor) {
                    const sync = cursor.value;
                    const index = testsKey.indexOf(sync.serverTestId);
                    if (index >= 0) {
                        const testHeader = tests[sync.serverTestId];
                        if (SyncManager.isShareModeNotEquals(sync.shareMode, testHeader.shareMode)) {
                            sync.shareMode = testHeader.shareMode;
                            DATABASE_MANAGER.updateSync(sync);
                        }
    
                        if (testHeader.last_modification > sync.lastModification) {
                            updates.push(SyncManager.getSyncFromSync(sync, this).updateTest(testHeader));
                        }
                        testsKey.splice(index, 1);
                    } else {
                        if (sync.shareMode[0].type === 'link') {
                            console.log(sync.shareMode[0].url);
                        } else if (sync.lastModification > 0) {
                            cursor.delete();
                            if (sync.testId >= 0) {
                                DATABASE_MANAGER.deleteTest(sync.testId); // TODO
                            }
                        }
                    }
                    cursor.continue();
                } else {
                    var add = [];
                    for (var index = 0; index < testsKey.length; index++) {
                        const key = testsKey[index];
                        const testHeader = tests[key];
                        let sync = {testId: -1, lastModification: 0, serverTestId: key, shareMode: testHeader.shareMode, 
                            authAccount: this.authId};
                        add.push(DATABASE_MANAGER.addSync(sync).then((event) => {
                            sync.pk = event.target.result;
                            updates.push(SyncManager.getSyncFromSync(sync, this).updateTest(testHeader));
                        }));
                    }
                    await Promise.all(add);
                    await Promise.all(updates);
                    resolve();
                    SyncManager.setSyncError(false);
                }
            }
            request.onerror = reject;
        });
    }

    async addTest(test, id, renameFrom) {
        await this.authFetch(`/test/new`, 'POST', {
                "last-modification": 1,
                modified: test.lastModificationDate.getTime(),
                override: true, // TODO
                test: test.getSafeTest(),
                id: id,
                renameFrom: renameFrom
            });
        await this.update();
    }
}

class Sync {
    constructor(sync, syncManager) {
        this.sync = sync;
        this.syncManager = syncManager;
    }

    updateTest(testHeader) {
        return new Promise(async resolve => {
            var testData = await this.syncManager.authFetchJson(`/test/${this.sync.serverTestId}?last_modification=${this.sync.lastModification}`);
            var test = Test.import(testData);
            if (test) {
                this.sync.lastModification = testHeader.last_modification;
                test.sync = this.sync.pk;
                if (this.sync.testId > 0) {
                    test.id = this.sync.testId;
                    var s = DATABASE_MANAGER.updateSync(this.sync);
                    var r = DATABASE_MANAGER.updateTest(test);
                    r.onsuccess = () => {
                        s.then(() => {
                            SyncManager.eventTarget.dispatchEvent(
                                new CustomEvent('testupdate', {detail: {testId: test.id}})
                            );
                            SyncManager.testChanged = true;
                            resolve();
                        });
                    };
                    r.onerror = resolve;
                } else {
                    var r = DATABASE_MANAGER.addNewTest(test);
                    r.onsuccess = async event => {
                        this.sync.testId = event.target.result;
                        await DATABASE_MANAGER.updateSync(this.sync);
                        SyncManager.eventTarget.dispatchEvent(
                            new CustomEvent('testupdate', {detail: {testId: test.id}})
                        );
                        SyncManager.testChanged = true;
                        resolve();
                    }
                    r.onerror = resolve;
                }
            } else {
                resolve();
            }
        });
    }

    async modifyTest(test) {
        await this.syncManager.authFetch(`/test/${this.sync.serverTestId}`, 'POST', {
            "last-modification": this.sync.lastModification,
            modified: test.lastModificationDate.getTime(),
            override: true, // TODO
            test: test.getSafeTest()

        });
        await this.syncManager.update();
    }

    async deleteTest() {
        await this.syncManager.authFetch(`/test/${this.sync.serverTestId}`, 'DELETE');
        await this.syncManager.update();
    }

    async getTestInfo() {
        const now = Date.now();
        if (now - this.sync.info?.lastRequest < SyncManager.MIN_CACHE && 
            document.timeline.currentTime > SyncManager.RELOAD_MAX_TIME) {
                return this.sync.info;
        } else {
            try {
                var data = await this.syncManager.authFetchJson(`/test/${this.sync.serverTestId}/info`);
            } catch (e) {
                if (this.sync.info) {
                    return this.sync.info;
                } else {
                    console.error(e);
                    throw new Error("Cannot load the informations about the test");
                }
            }
            data.serverTestId = this.sync.serverTestId;
            data.lastRequest = now;
            this.sync.info = data;
            DATABASE_MANAGER.updateSync(this.sync);
            return data;
        }
    }

    async getTestShare(forceReload) {
        const now = Date.now();
        if (!forceReload && now - this.sync.share?.lastRequest < SyncManager.MIN_CACHE && 
            document.timeline.currentTime > SyncManager.RELOAD_MAX_TIME) {
                return this.sync.share;
        } else {
            try {
                var data = await this.syncManager.authFetchJson(`/test/${this.sync.serverTestId}/share`);
            } catch (e) {
                if (this.sync.share) {
                    return this.sync.share;
                } else {
                    console.error(e);
                    throw new Error("Cannot load the informations about the share");
                }
            }
            data.serverTestId = this.sync.serverTestId;
            data.lastRequest = now;
            this.sync.share = data;
            DATABASE_MANAGER.updateSync(this.sync);
            return data;
        }
    }

    async setTestShare(type, perms, name, action) {
        return this.syncManager.authFetch(`/test/${this.sync.serverTestId}/share`, 'POST', {
            action: action,
            name: name,
            perms: perms,
            type: type
        });
    }
}

DATABASE_MANAGER.initAsyncFunc.then(SyncManager.initialise.bind(SyncManager));

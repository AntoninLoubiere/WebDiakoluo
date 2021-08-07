const listPageView = document.getElementById('list-page');

const testListTemplate = document.getElementById('list-test-child-template');
const testListSyncTemplate = document.getElementById('list-test-sync');
const testListSectionParent = document.getElementById('list-page-sections');
const testListSectionTemplate = document.getElementById('list-page-section-template');

document.getElementById('list-add-button').onclick = UTILS.addTestRedirect;

class ListPage extends Page {
    static MAX_RECENT = 5;
    constructor() {
        super(listPageView, '', false);

        this.localTestList = this.createNewSection('local');
        this.recentTestList = this.createNewSection('recent');
        this.testLists = {};

        document.getElementById('list-import-button').onclick = () => UTILS.importTest();
        document.getElementById('list-export-all-button').onclick = () => UTILS.exportAllTest();

        this.contextMenu = new ContextMenu('list-page-context-menu');
        document.getElementById('list-test-play-button').onclick = () => UTILS.playTestPage(this.contextMenu.dataIndex);
        document.getElementById('list-test-eval-button').onclick = () => UTILS.evalTestPage(this.contextMenu.dataIndex);
        document.getElementById('list-test-edit-button').onclick = () => UTILS.editTestPage(this.contextMenu.dataIndex);
        document.getElementById('list-test-duplicate-button').onclick = () => UTILS.duplicateTest(this.contextMenu.dataIndex);
        document.getElementById('list-test-export-button').onclick = () => UTILS.exportTest(this.contextMenu.dataIndex);
        document.getElementById('list-test-delete-button').onclick = () => UTILS.deleteTest(this.contextMenu.dataIndex);

        this.needReload = true;
        this.reloadLock = Promise.resolve();
        this.waitingLock = false;
    }

    /* load list page */
    onload() {
        I18N.updatePageTitle('title-index');
        listPageView.classList.remove('hide');
        if (this.needReload) {
            this.reloadList();
        } else {
            this.reloadRecent();
        }
    }

    /* create a new test list section */
    createNewSection(type, title, titleIsId) {
        const sec = testListSectionTemplate.content.cloneNode(true);
        if (type) {
            if (titleIsId) {
                let e = document.createElement('x-i18n');
                e.setAttribute('key', title);
                sec.querySelector('.list-page-section-title').appendChild(e);
            } else {
                sec.querySelector('.list-page-section-title').textContent = title;
            }
        } else {
            sec.querySelector('.list-page-section-title').hidden = true;
        }
        if (type) {
            sec.firstElementChild.classList.add('list-page-section-' + type);
        }
        let testList = sec.querySelector('.test-list');
        testListSectionParent.append(sec);
        return testList;
    }

    onkeydown(event) {
        if (event.keyCode == KeyboardEvent.DOM_VK_ESCAPE) {
            if (this.contextMenu.disimiss()) {
                event.stopPropagation();               
            }
        }
    }

    /* when a context menu is used on a test */
    oncontextmenu(event, index, playable) {
        event.preventDefault();
        this.contextMenu.show(event.pageX, event.pageY);
        this.contextMenu.dataIndex = index;
        this.contextMenu.dataPlayable = playable;
    }

    /* when the page is clicked */
    onclick(event) {
        if (this.contextMenu.disimiss()) {
            event.preventDefault();
            document.activeElement.blur();
        }
    }

    reload() {
        if (currentPage === this) {
            this.reloadList();
        } else {
            this.needReload = true;
        }
    }

    async lock() {
        if (this.waitingLock) return;
        this.needReload = false;

        this.waitingLock = true;
        await this.reloadLock;
        let resolveFunc;
        this.reloadLock = new Promise(resolve => resolveFunc = resolve);
        this.waitingLock = false;
        return resolveFunc;
    }

    /* reload the test list */
    async reloadList() {
        var resolveFunc = await this.lock();

        for (let c of testListSectionParent.querySelectorAll('.test-list')) {
            removeAllChildren(c);
        }

        let promises = [];
        let recent = [];

        DATABASE_MANAGER.forEachHeader().onsuccess = event => {
            var cursor = event.target.result;
            if (cursor) {
                var test = cursor.value;
                var id = cursor.value.id;
                this.registerRecent(recent, test);
                if (id == EDIT_KEY) {
                    var template = testListTemplate.content.cloneNode(true);
                    template.querySelector('.test-title-span').textContent = I18N.getTranslation("edited-test");
                    template.querySelector('.test-description').textContent = test.title;
                    template.children[0].onclick = function() {
                        UTILS.editTestPage('current');
                    }
                    this.localTestList.insertBefore(template, this.localTestList.firstChild); // insert at first
                } else if (test.sync) {
                    promises.push(SyncManager.getSyncFromTest(test).then(async sync => {
                        if (this.waitingLock) return;
                        if (sync.sync.authAccount == SyncManager.LINK) {
                            this.addTestToSection(test, this.createSyncSection({type: SyncManager.LINK}), true);
                        } else {
                            const shareModes = sync.sync.shareMode;
                            for (let i = shareModes.length - 1; i >= 0; i--) {
                                this.addTestToSection(
                                    test,
                                    this.createSyncSection(shareModes[i]),
                                    true
                                );
                            }
                        }
                    }));
                } else {
                    this.addTestToSection(test, this.localTestList);
                }
                if (this.waitingLock) {
                    Promise.all(promises).then(resolveFunc);
                } else {
                    cursor.continue();
                }
            } else {
                for (let t of recent) {
                    this.addTestToSection(t, this.recentTestList, t.sync);
                }
                Promise.all(promises).then(() => {
                    this.sectionMayAddEmpty(this.localTestList);
                    this.sectionMayAddEmpty(this.recentTestList);
                    let keys = Object.keys(this.testLists);
                    for (let k of keys) {
                        let list = this.testLists[k];
                        if (!list.childElementCount) {
                            list.parentElement.remove();
                            delete this.testLists[k];
                        }
                    }
                    resolveFunc();
                });
            }
        };
    }

    async reloadRecent() {
        var resolveFunc = await this.lock();
        let recent = [];

        removeAllChildren(this.recentTestList);

        DATABASE_MANAGER.forEachHeader().onsuccess = event => {
            if (this.waitingLock) {
                resolveFunc();
                return;
            }

            var cursor = event.target.result;
            if (cursor) {
                var test = cursor.value;
                this.registerRecent(recent, test);
                cursor.continue();
            } else {
                for (let t of recent) {
                    this.addTestToSection(t, this.recentTestList, t.sync);
                }
                resolveFunc();
            }
        }
    }

    /* register a recent test in the list */
    registerRecent(list, test) {
        if (test.lastUsed) {
            let i = list.findIndex(a => a.lastUsed < test.lastUsed);
            if (i < 0) i = list.length;
            if (i < ListPage.MAX_RECENT) {
                list.splice(i, 0, test);
                list.splice(ListPage.MAX_RECENT, list.length);
            }
        }
    }

    /* add a test item to the section */
    addTestToSection(test, sectionList, sync) {
        var template = testListTemplate.content.cloneNode(true);
        var titleSpan = template.querySelector('.test-title-span');
        if (sync) {
            var syncElement = testListSyncTemplate.content.cloneNode(true);
            template.querySelector('.test-title').insertBefore(syncElement, titleSpan);
        }
        titleSpan.textContent = test.title;
        template.querySelector('.test-description').textContent = test.description;
        template.children[0].onclick = function() {
            UTILS.viewTestPage(test.id);
        }
        template.children[0].onkeydown = onReturnClick;
        template.children[0].oncontextmenu = e => this.oncontextmenu(e, test.id, test.playable);
        sectionList.appendChild(template);
    }

    /* if the section is empty add text */
    sectionMayAddEmpty(section) {
        if (!section.childElementCount) {
            let header = document.createElement('h3');
            let i18n = document.createElement('x-i18n');
            i18n.setAttribute('key', 'list-test-empty-section');
            header.append(i18n);
            section.appendChild(header);
        }
    }

    /* create a sync section */
    createSyncSection(shareMode) {
        if (shareMode.type == "owner") {
            if (this.testLists.owner) {
                return this.testLists.owner;
            }
            let sec = this.createNewSection('owner');
            this.testLists.owner = sec;
            return sec;
        } else if (shareMode.type == "link") {
            if (this.testLists.link) {
                return this.testLists.link;
            }
            let sec = this.createNewSection('link');
            this.testLists.link = sec;
            return sec;
        } else if (shareMode.type == "user") {
            if (this.testLists[shareMode.username]) {
                return this.testLists[shareMode.username];
            }
            let sec = this.createNewSection(
                'user',
                `${shareMode.name} (${shareMode.username})`,
            );
            this.testLists[shareMode.username] = sec;
            return sec;
        } else if (shareMode.type == "group") {
            if (this.testLists[shareMode.name]) {
                return this.testLists[shareMode.name];
            }
            let sec = this.createNewSection(
                'group',
                `${shareMode.long_name} (${shareMode.name})`
            );
            this.testLists[shareMode.name] = sec;
            return sec;
        }

        return this.localTestList;
    }
}

const defaultPage = new ListPage();
const listPageView = document.getElementById('list-page');

const testListTemplate = document.getElementById('list-test-child-template');
const testListSyncTemplate = document.getElementById('list-test-sync');
const testListSectionParent = document.getElementById('list-page-sections');
const testListSectionTemplate = document.getElementById('list-page-section-template');

document.getElementById('list-add-button').onclick = UTILS.addTestRedirect;

class ListPage extends Page {
    constructor() {
        super(listPageView, '', false);

        this.localTestList = this.createNewSection('list-test-locals', 'local', true);
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
        if (this.needReload) this.reloadList();
    }

    /* create a new test list section */
    createNewSection(title, type, titleIsId) {
        const sec = testListSectionTemplate.content.cloneNode(true);
        if (titleIsId) {
            let e = document.createElement('x-i18n');
            e.setAttribute('key', title);
            sec.querySelector('.list-page-section-title').appendChild(e);
        } else {
            sec.querySelector('.list-page-section-title').textContent = title;
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

    /* reload the test list */
    async reloadList() {
        if (this.waitingLock) return;
        this.needReload = false;

        this.waitingLock = true;
        await this.reloadLock;
        let resolveFunc;
        this.reloadLock = new Promise(resolve => resolveFunc = resolve);
        this.waitingLock = false;

        for (let c of testListSectionParent.querySelectorAll('.test-list')) {
            removeAllChildren(c);
        }

        let promises = [];

        DATABASE_MANAGER.forEachHeader().onsuccess = event => {
            var cursor = event.target.result;
            if (cursor) {
                var t = testListTemplate.content.cloneNode(true);
                var v = cursor.value;
                var id = cursor.value.id;
                if (id == EDIT_KEY) {
                    t.querySelector('.test-title-span').textContent = I18N.getTranslation("edited-test");
                    t.querySelector('.test-description').textContent = v.title;
                    t.children[0].onclick = function() {
                        UTILS.editTestPage('current');
                    }
                    this.localTestList.insertBefore(t, this.localTestList.firstChild); // insert at first
                } else if (v.sync) {
                    var titleSpan = t.querySelector('.test-title-span');
                    var sync = testListSyncTemplate.content.cloneNode(true);
                    t.querySelector('.test-title').insertBefore(sync, titleSpan);
                    promises.push(SyncManager.getSyncFromTest(v).then(async sync => {
                        if (this.waitingLock) return;
                        if (sync.sync.authAccount == SyncManager.LINK) {
                            this.addTestToSection(t, v, this.createSyncSection({type: SyncManager.LINK}));
                        } else {
                            const shareModes = sync.sync.shareMode;
                            for (let i = shareModes.length - 1; i >= 0; i--) {
                                this.addTestToSection(
                                    i > 0 ? t.cloneNode(true) : t,
                                    v,
                                    this.createSyncSection(shareModes[i])
                                );
                            }
                        }
                    }));
                } else {
                    this.addTestToSection(t, v, this.localTestList);
                }
                if (this.waitingLock) {
                    Promise.all(promises).then(resolveFunc);
                } else {
                    cursor.continue();
                }
            } else {
                Promise.all(promises).then(() => {
                    let keys = Object.keys(this.testLists);
                    for (let k of keys) {
                        let list = this.testLists[k];
                        if (!list.childElementCount) {
                            console.log(list, list.parentElement);
                            list.parentElement.remove();
                            delete this.testLists[k];
                        }
                    }
                    resolveFunc();
                });
            }
        };
    }

    /* add a test item to the section */
    addTestToSection(template, value, sectionList) {
        template.querySelector('.test-title-span').textContent = value.title;
        template.querySelector('.test-description').textContent = value.description;
        template.children[0].onclick = function() {
            UTILS.viewTestPage(value.id);
        }
        template.children[0].onkeydown = onReturnClick;
        template.children[0].oncontextmenu = e => this.oncontextmenu(e, value.id, value.playable);
        sectionList.appendChild(template);
    }

    /* create a sync section */
    createSyncSection(shareMode) {
        if (shareMode.type == "owner") {
            if (this.testLists.owner) {
                return this.testLists.owner;
            }
            let sec = this.createNewSection('list-test-sync-owner-section', 'owner', true);
            this.testLists.owner = sec;
            return sec;
        } else if (shareMode.type == "link") {
            if (this.testLists.link) {
                return this.testLists.link;
            }
            let sec = this.createNewSection('list-test-sync-link-section', 'link', true);
            this.testLists.link = sec;
            return sec;
        } else if (shareMode.type == "user") {
            if (this.testLists[shareMode.username]) {
                return this.testLists[shareMode.username];
            }
            let sec = this.createNewSection(
                `${I18N.getTranslation('list-test-sync-user-section')} ${shareMode.name} (${shareMode.username})`,
                'user'
            );
            this.testLists[shareMode.username] = sec;
            return sec;
        } else if (shareMode.type == "group") {
            if (this.testLists[shareMode.name]) {
                return this.testLists[shareMode.name];
            }
            let sec = this.createNewSection(
                `${I18N.getTranslation('list-test-sync-group-section')} ${shareMode.long_name} (${shareMode.name})`,
                'group'
            );
            this.testLists[shareMode.name] = sec;
            return sec;
        }

        return this.localTestList;
    }
}

const defaultPage = new ListPage();
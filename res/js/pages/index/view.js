const viewPageView = document.getElementById('view-page');

const viewPageTitle = [document.getElementById('view-test-title'), document.getElementById('view-test-title2')];
const viewPageTitleSync = document.getElementById('view-test-title-sync');
const viewPageDescription = document.getElementById('view-test-description');
const viewPageCreatedDate = document.getElementById('view-test-created-date');
const viewPageModificationDate = document.getElementById('view-test-modification-date');
const viewPageColumnsList = document.getElementById('view-test-columns');
const viewPageDataTableHeader = document.getElementById('view-test-data-header');
const viewPageDataTableBody = document.getElementById('view-test-data-body');

const viewColumnModal = new Modal(document.getElementById('view-test-column-modal'));
const viewColumnModalTitle1 = document.getElementById('modal-view-column-title1');
const viewColumnModalTitle2 = document.getElementById('modal-view-column-title2');
const viewColumnModalDescription = document.getElementById('modal-view-column-description');
const viewColumnModalSettings = document.getElementById('modal-view-column-settings');

const viewSyncDiv = document.getElementById('view-sync');
const viewSyncId = document.getElementById('view-sync-test-id');
const viewSyncPerms = document.getElementById('view-sync-test-perms');
const viewSyncOwner = document.getElementById('view-sync-test-owner');
const viewSyncShareButton = document.getElementById('sync-share-button');
const viewSyncShareModal = new Modal(document.getElementById('sync-share-modal'));
const viewSyncShareLink = document.getElementById('sync-share-link');
const viewSyncShareLinkShare = document.getElementById('sync-share-link-share');
const viewSyncShareLinkPopup = document.getElementById('sync-share-link-popup');
const viewSyncShareShares = document.getElementById('sync-share-shares');
const viewSyncShareAddName = document.getElementById('sync-share-add-name');
const viewSyncShareAddNameDataList = document.getElementById('sync-share-add-name-datalist');
const viewSyncShareAddType = document.getElementById('sync-share-add-type');
const viewSyncShareAddPerms = document.getElementById('sync-share-add-perms');
const viewSyncShareAddForm = document.getElementById('sync-share-add-form');
const viewSyncSharePermsTemplate = document.getElementById('sync-share-perms-rule');
const viewSyncSharePermsTemplateSelect = viewSyncSharePermsTemplate.content.querySelector('.sync-share-perms-select');

const viewDataModal = new Modal(document.getElementById('view-test-data-modal'));
const viewDataModalContent = document.getElementById('view-test-data-content');
const viewDataModalId = document.getElementById('view-test-data-id');

const viewColumnTemplate = document.getElementById('view-column-child-template');
const viewDataTemplate = document.getElementById('view-data-child-template');

class ViewPage extends Page {
    constructor() {
        super(viewPageView, "view", true);

        document.getElementById('view-play-button').onclick = () => UTILS.playTestPage();
        document.getElementById('view-eval-button').onclick = () => UTILS.evalTestPage();
        document.getElementById('view-edit-button').onclick = () => UTILS.editTestPage();
        document.getElementById('view-export-button').onclick = () => UTILS.exportTest();
        document.getElementById('view-delete-button').onclick = () => UTILS.deleteTest();

        this.columnsModalNav = new NavigationBar(document.getElementById('view-column-nav-bar'), [
            {className: "nav-edit", onclick: () => UTILS.editTestPage()}
        ]);
        this.columnsModalNav.onfirst = this.firstColumn.bind(this); 
        this.columnsModalNav.onprevious = this.previousColumn.bind(this); 
        this.columnsModalNav.onnext = this.nextColumn.bind(this); 
        this.columnsModalNav.onlast = this.lastColumn.bind(this); 

        this.dataModalNav = new NavigationBar(document.getElementById('view-data-nav-bar'), [
            {className: "nav-edit", onclick: () => UTILS.editTestPage()}
        ]);
        this.dataModalNav.onfirst = this.firstData.bind(this); 
        this.dataModalNav.onprevious = this.previousData.bind(this); 
        this.dataModalNav.onnext = this.nextData.bind(this); 
        this.dataModalNav.onlast = this.lastData.bind(this);

        viewSyncShareButton.onclick = this.showShareModal.bind(this);
        viewSyncShareLink.onchange = this.onChangeLinkPerms.bind(this);
        viewSyncShareAddForm.onsubmit = this.onAddPerm.bind(this);
        viewSyncShareAddName.oninput = this.onChangeAddName.bind(this);
        viewSyncShareLinkShare.onclick = this.copyShareLink.bind(this);

        I18N.initAsyncFunc.then(() => {
            for (const perm of SyncManager.PERMS) {
                var e = document.createElement('option');
                e.text = I18N.getTranslation('perm-' + perm);
                e.value = perm;
                viewSyncShareLink.options.add(e);
                viewSyncSharePermsTemplateSelect.options.add(e.cloneNode(true));
                viewSyncShareAddPerms.options.add(e.cloneNode(true));
            }

            e = document.createElement('option');
            e.text = I18N.getTranslation('user');
            e.value = 'user';
            viewSyncShareAddType.options.add(e);

            e = document.createElement('option');
            e.text = I18N.getTranslation('group');
            e.value = 'group';
            viewSyncShareAddType.options.add(e);
        });
    }

    /* when the page is loaded */
    onload() {
        this.loadUI();
        this.updateModals(true);
    }

    loadUI() {
        for (var i = 0; i < viewPageTitle.length; i++) {
            viewPageTitle[i].textContent = currentTest.title;
        }
        if (currentTest.sync) {
            viewPageTitleSync.classList.remove('hide');
            viewSyncDiv.classList.remove('hide');
            const loading = I18N.getTranslation('loading');
            viewSyncId.textContent = loading;
            viewSyncPerms.textContent = loading;
            viewSyncOwner.textContent = loading;

    
            SyncManager.getSyncFromTest(currentTest).then(sync => {
                this.sync = sync;
                return sync.getTestInfo();
            }).then(data => {
                viewSyncId.textContent = data.serverTestId;
                viewSyncPerms.textContent = I18N.getTranslation('perm-' + data.share);
                viewSyncShareButton.src = data.share === 'share' || data.share === 'owner' ? 
                    '/WebDiakoluo/res/img/edit.svg' : '/WebDiakoluo/res/img/view.svg';
                viewSyncOwner.textContent =`${data.owner.name} (${data.owner.username})`
            });
        } else {
            viewPageTitleSync.classList.add('hide');
            viewSyncDiv.classList.add('hide');
            delete this.sync
        }
        
        viewPageDescription.textContent = currentTest.description;
        viewPageCreatedDate.textContent = DATE_FORMATTER.format(currentTest.createDate);
        viewPageModificationDate.textContent = DATE_FORMATTER.format(currentTest.lastModificationDate);

        removeAllChildren(viewPageColumnsList);
        removeAllChildren(viewPageDataTableHeader);
        removeAllChildren(viewPageDataTableBody);
        var e;
        var row = viewDataTemplate.content.cloneNode(true);
        row.querySelector('.min').innerHTML = '<x-i18n key="view"></x-i18n>';
        for (let i = 0; i < currentTest.columns.length; i++) {
            e = viewColumnTemplate.content.cloneNode(true);
            e.querySelector('.test-column-text').textContent = currentTest.columns[i].name;
            e.children[0].onclick = () => {
                this.columnClickCallback(i);
            };
            e.children[0].onkeydown = onReturnClick;

            viewPageColumnsList.appendChild(e);

            e = document.createElement('td');
            e.textContent = currentTest.columns[i].name;
            row.children[0].appendChild(e);
        }
        viewPageDataTableHeader.appendChild(row);

        for (let i = 0; i < currentTest.data.length; i++) {
            row = viewDataTemplate.content.cloneNode(true);
            for (var j = 0; j < currentTest.data[i].length; j++) {
                e = document.createElement('td');
                e.appendChild(currentTest.columns[j].getViewView(currentTest.data[i][j]));
                row.children[0].appendChild(e);
            }
            row.children[0].onclick = () => {
                this.dataClickCallback(i);
            }
            row.children[0].onkeydown = onReturnClick;
            viewPageDataTableBody.appendChild(row);
        }

        viewColumnModal.id = -1;
        viewDataModal.id = -1;
        I18N.setPageTitle(currentTest.title);
        viewPageView.classList.remove('hide');
    }

    ontestreload() {
        this.loadUI();
        this.onupdate();
    }

    /* when the page is updated */
    onupdate() {
        this.updateModals(false);
    }

    updateModals(addHistory) {
        var p = Number(currentURL.searchParams.get('column'));
        if (p) {
            if (p > currentTest.columns.length) p = currentTest.data.length;
            if (p <= 0) p = 1;
            if (addHistory) {
                var url = new URL(currentURL);
                url.searchParams.delete('column');
                history.replaceState({}, '', url);
            }
            this.updateColumnModal(p - 1, addHistory);
            return;
        }

        p = Number(currentURL.searchParams.get('data'));
        if (p) {
            if (p > currentTest.data.length) p = currentTest.data.length;
            if (p <= 0) p = 1;
            if (addHistory) {
                var url = new URL(currentURL);
                url.searchParams.delete('data');
                history.replaceState({}, '', url);
            }
            this.updateDataModal(p - 1, addHistory);
            return;
        }
    }

    /* when a key is press */
    onkeydown(event) {
        switch (event.keyCode) {
            case KeyboardEvent.DOM_VK_RIGHT:
                if (Modal.currentModal === viewColumnModal) {
                    this.nextColumn();
                    event.preventDefault();
                } else if (Modal.currentModal == viewDataModal) {
                    this.nextData();
                    event.preventDefault();
                }
                break;

            case KeyboardEvent.DOM_VK_LEFT:
                if (Modal.currentModal === viewColumnModal) {
                    this.previousColumn();
                    event.preventDefault();
                } else if (Modal.currentModal == viewDataModal) {
                    this.previousData();
                    event.preventDefault();
                }
                break;

            case KeyboardEvent.DOM_VK_PAGE_DOWN:
                if (Modal.currentModal === viewColumnModal) {
                    this.lastColumn();
                    event.preventDefault();
                } else if (Modal.currentModal == viewDataModal) {
                    this.lastData();
                    event.preventDefault();
                }
                break;

            case KeyboardEvent.DOM_VK_PAGE_UP:
                if (Modal.currentModal === viewColumnModal) {
                    this.firstColumn();
                    event.preventDefault();
                } else if (Modal.currentModal == viewDataModal) {
                    this.firstData();
                    event.preventDefault();
                }
                break;
        }

        if (event.altKey) {
            switch (event.keyCode) {
                case KeyboardEvent.DOM_VK_S:
                    event.preventDefault();
                    UTILS.playTestPage();
                    break;

                case KeyboardEvent.DOM_VK_G:
                    event.preventDefault();
                    UTILS.evalTestPage();
                    break;

                case KeyboardEvent.DOM_VK_E:
                    event.preventDefault();
                    UTILS.editTestPage();
                    break;
            }
        }
    }

    /* update the column modal */
    updateColumnModal(id, addHistory=true) {
        if (Modal.currentModal !== viewColumnModal) {
            viewColumnModal.show(true, addHistory);
        }
        if (viewColumnModal.id != id) {
            viewColumnModal.id = id;
            this.columnsModalNav.updateStatus(id <= 0, id >= currentTest.columns.length - 1);
            
            var column = currentTest.columns[id];
            viewColumnModalTitle1.textContent = column.name;
            viewColumnModalTitle2.textContent = column.name;
            viewColumnModalDescription.textContent = column.description;
            viewColumnModalSettings.replaceChild(
                column.getViewColumnSettings(),
                viewColumnModalSettings.children[0]
            );
        }
    }

    /* update the data modal */
    updateDataModal(id, addHistory=true) {
        if (Modal.currentModal !== viewDataModal) {
            viewDataModal.show(true, addHistory);
        }
        if (viewDataModal.id != id) {
            viewDataModal.id = id;
            this.dataModalNav.updateStatus(id <= 0, id >= currentTest.data.length - 1);

            var row = currentTest.data[id];
            viewDataModalId.textContent = id + 1;
            removeAllChildren(viewDataModalContent);
            var e;
            var column;
            for (var i = 0; i < row.length; i++) {
                column = currentTest.columns[i];
                e = document.createElement('h3');
                e.textContent = column.name + ":";
                e.classList = ['no-margin']
                viewDataModalContent.appendChild(e);

                viewDataModalContent.appendChild(column.getViewView(row[i]));
            }
        }
    }

    /* when a column is clicked */
    columnClickCallback(id) {
        currentURL.searchParams.set('column', id + 1);
        this.updateColumnModal(id);
    }

    /* go to the next column */
    nextColumn() {
        if (viewColumnModal.id < currentTest.columns.length - 1) {
            this.updateColumnModal(viewColumnModal.id + 1); // don't add to history in order to not spam the history 
        }
    }

    /* go to the previous column */
    previousColumn() {
        if (viewColumnModal.id > 0) {
            this.updateColumnModal(viewColumnModal.id - 1);
        }
    }

    /* go to the first column */
    firstColumn() {
        this.updateColumnModal(0);
    }

    /* go to the last column */
    lastColumn() {
        this.updateColumnModal(currentTest.columns.length - 1);
    }

    /* when a data is clicked */
    dataClickCallback(id) {
        currentURL.searchParams.set('data', id + 1);
        this.updateDataModal(id);
    }

    /* go to the next data */
    nextData() {
        if (viewDataModal.id < currentTest.data.length - 1) {
            this.updateDataModal(viewDataModal.id + 1);
        }
    }

    /* go to the previous data */
    previousData() {
        if (viewDataModal.id > 0) {
            this.updateDataModal(viewDataModal.id - 1);
        }
    }

    /* go to the first data */
    firstData() {
        this.updateDataModal(0);
    }

    /* go to the last data */
    lastData() {
        this.updateDataModal(currentTest.data.length - 1);
    }

    showShareModal() {
        viewSyncShareModal.show();
        viewSyncShareShares.textContent = I18N.getTranslation('loading');
        this.loadShareModalUI();
    }

    async loadShareModalUI(forceReload) {
        this.sync.getTestShare(forceReload).then(data => {
            viewSyncShareLink.value = data["links-perms"];
            viewSyncShareShares.textContent = "";

            for (var i = 0; i < data.users.length; i++) {
                const e = viewSyncSharePermsTemplate.content.cloneNode(true);
                let user = {
                    data: data.users[i],
                    row: e.children[0],
                    select: e.querySelector('.sync-share-perms-select')
                }
                e.querySelector('.share-type').src = '/WebDiakoluo/res/img/user.svg';
                e.querySelector('.share-name').textContent = `${user.data.name} (${user.data.username})`;
                e.querySelector('.share-delete-button').onclick = () => {
                    this.deleteUserPerms(user);
                }
                user.select.value = user.data.perms;
                user.select.onchange = () => {
                    this.onChangeUserPerms(user);
                }
                viewSyncShareShares.appendChild(e);
            }

            for (var i = 0; i < data.groups.length; i++) {
                const e = viewSyncSharePermsTemplate.content.cloneNode(true);
                let group = {
                    data: data.groups[i],
                    row: e.children[0],
                    select: e.querySelector('.sync-share-perms-select')
                }
                e.querySelector('.share-type').src = '/WebDiakoluo/res/img/group.svg';
                e.querySelector('.share-name').textContent = `${group.data.long_name} (${group.data.name})`;
                e.querySelector('.share-delete-button').onclick = () => {
                    this.deleteGroupPerms(group);
                }
                group.select.onchange = () => {
                    this.onChangeGroupPerms(group);
                }
                group.select.value = group.data.perms;
                viewSyncShareShares.appendChild(e);
            }
        });

        if (viewSyncShareAddNameDataList.childElementCount <= 0) {
            const usersPromise = this.sync.syncManager.getUsers();
            const groupsPromise = this.sync.syncManager.getGroups();
            const groupText = I18N.getTranslation('group');
            const users = await usersPromise;
            const usernames = Object.keys(users);
            for (var i = 0; i < usernames.length; i++) {
                const e = document.createElement('option');
                const username = usernames[i];
                const name = users[username];
                e.value = username;
                e.textContent = `${name} - ${username}`;
                viewSyncShareAddNameDataList.appendChild(e);
            }

            const groups = await groupsPromise;
            const groupsName = Object.keys(groups);
            for (var i = 0; i < groupsName.length; i++) {
                const e = document.createElement('option');
                const name = groupsName[i];
                const long_name = groups[name];
                e.value = name;
                e.textContent = `${long_name} - ${name} (${groupText})`;
                viewSyncShareAddNameDataList.appendChild(e);
            }
        }
    }

    onChangeLinkPerms() {
        viewSyncShareLink.disabled = true;
        this.sync.setTestShare('link', viewSyncShareLink.value).catch(() => {
            viewSyncShareLink.value = this.sync.sync.share["links-perms"];
        }).finally(() => {
            viewSyncShareLink.disabled = false;
        })
    }

    onChangeUserPerms(user) {
        user.select.disabled = true;
        this.sync.setTestShare('user', user.select.value, user.data.username, 'edit').catch(() => {
            user.select.value = user.data.perms;
        }).finally(() => {
            user.select.disabled = false;
        });
        this.sync.sync.share.requestTime = 0; // reset cache
    }

    deleteUserPerms(user) {
        user.row.classList.add('hide');
        this.sync.setTestShare('user', 0, user.data.username, 'delete')
        .then((e) => {
            user.row.remove();
        }).catch((e) => {
            user.row.classList.remove('hide');
        });
        this.sync.sync.share.requestTime = 0; // reset cache
    }

    onChangeGroupPerms(group) {
        group.select.disabled = true;
        this.sync.setTestShare('group', group.select.value, group.data.name, 'edit').catch(() => {
            group.select.value = group.data.perms;
        }).finally(() => {
            group.select.disabled = false;
        });
        this.sync.sync.share.requestTime = 0; // reset cache
    }

    deleteGroupPerms(group) {
        group.row.classList.add('hide');
        this.sync.setTestShare('group', 0, group.data.name, 'delete')
        .then(() => {
            group.row.remove();
        }).catch(() => {
            group.row.classList.remove('hide');
        });
        this.sync.sync.share.requestTime = 0; // reset cache
    }

    onChangeAddName() {
        if (this.sync.syncManager.users?.[viewSyncShareAddName.value]) {
            viewSyncShareAddType.value = 'user';
        } else if (this.sync.syncManager.groups?.[viewSyncShareAddName.value]) {
            viewSyncShareAddType.value = 'group';
        }
    }

    onAddPerm(e) {
        e.preventDefault();
        viewSyncShareAddName.disabled = true;
        viewSyncShareAddType.disabled = true;
        viewSyncShareAddPerms.disabled = true;

        this.sync.setTestShare(viewSyncShareAddType.value, viewSyncShareAddPerms.value, viewSyncShareAddName.value, 'add')
        .then(() => {
            viewSyncShareAddName.value = "";
            this.loadShareModalUI(true);
        }).finally(() => {
            viewSyncShareAddName.disabled = false;
            viewSyncShareAddType.disabled = false;
            viewSyncShareAddPerms.disabled = false;
        });
    }

    copyShareLink() {
        var url = new URL(currentURL);
        url.search = "";
        url.searchParams.set('page', 'api');
        url.searchParams.set('action', 'import-url');
        url.searchParams.set('host', this.sync.syncManager.host);
        url.searchParams.set('id', this.sync.sync.serverTestId);
        url = url.toString();

        if (navigator.clipboard) {
            navigator.clipboard.writeText(url);
            viewSyncShareLinkPopup.classList.add('popup-show');
            setTimeout(() => viewSyncShareLinkPopup.classList.remove('popup-show'), 3_000);
        } else {
            alert(I18N.getTranslation('link') + ': ' + url)
        }
    }
}

PAGES.view = new ViewPage();

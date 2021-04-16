const listPageView = document.getElementById('list-page');
const listPageTestList = document.getElementById('list-test');

const testListTemplate = document.getElementById('list-test-child-template');

document.getElementById('list-add-button').onclick = UTILS.addTestRedirect;

class ListPage extends Page {
    constructor() {
        super(listPageView, "", false);

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
    }

    /* load list page */
    onload() {
        I18N.updatePageTitle('title-index.html');
        listPageView.classList.remove('hide');
        if (this.needReload) this.reloadList();
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

    /* reload the test list */
    reloadList() {
        this.needReload = false;
        removeAllChildren(listPageTestList);
        DATABASE_MANAGER.forEachHeader().onsuccess = event => {
            var cursor = event.target.result;
            if (cursor) {
                var t = testListTemplate.content.cloneNode(true);
                var v = cursor.value;
                var id = cursor.value.id;
                var playable = cursor.value.playable;
                if (id == EDIT_KEY) {
                    t.querySelector('.test-title').textContent = I18N.getTranslation("edited-test");
                    t.querySelector('.test-description').textContent = v.title;
                    t.children[0].onclick = function() {
                        UTILS.editTestPage('current');
                    }
                    listPageTestList.insertBefore(t, listPageTestList.firstChild); // insert at first
                } else {
                    t.querySelector('.test-title').textContent = v.title;
                    t.querySelector('.test-description').textContent = v.description;
                    t.children[0].onclick = function() {
                        UTILS.viewTestPage(id);
                    }
                    t.children[0].onkeydown = onReturnClick;
                    t.children[0].oncontextmenu = e => this.oncontextmenu(e, id, playable);
                    listPageTestList.appendChild(t);
                    cursor.continue();
                }
            }
        };
    }
}

const defaultPage = new ListPage();
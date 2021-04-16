class ContextMenu {
    constructor(contextMenuId) {
        this.shown = false;
        this.revertX = false;
        this.contextMenu = document.getElementById(contextMenuId);
    }

    /* show the context menu at the pos x and y */
    show(x, y) {
        this.shown = true;
        this.contextMenu.classList.add('context-show');

        if (x + this.contextMenu.offsetWidth > window.innerWidth) {
            x -= this.contextMenu.offsetWidth;
            this.revertX = true;
            this.contextMenu.classList.add('revertX');
        } else if (this.revertX) {
            this.contextMenu.classList.remove('revertX');
            this.revertX = false;
        }

        this.contextMenu.style.left = x + 'px';
        this.contextMenu.style.top = y + 'px';
        this.elementFocus = document.activeElement;
        this.contextMenu.children[0].focus();
    }

    /* disimiss the context menu and return if it has done something */
    disimiss() {
        if (this.shown) {
            this.shown = false;
            this.contextMenu.classList.remove('context-show');
            this.elementFocus.focus();
            this.elementFocus = null;
            return true;
        }
        return false;
    }
}
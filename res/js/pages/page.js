class Page {
    constructor(pageView, pageName, requireTest, onload, onupdate, ondelete, onkeydown) {
        this.page = pageView;
        this.pageName = pageName;
        this.onload = onload;
        this.onupdate = onupdate;
        this.ondelete = ondelete;
        this.requireTest = requireTest;
        this.onkeydown = onkeydown;
    }

    hidePage() {
        this.page?.classList.add('hide');
    }
}
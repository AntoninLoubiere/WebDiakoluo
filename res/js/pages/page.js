class Page {
    constructor(pageView, pageName, requireTest, onload, onupdate, ondelete) {
        this.page = pageView;
        this.pageName = pageName;
        this.onload = onload;
        this.onupdate = onupdate;
        this.ondelete = ondelete;
        this.requireTest = requireTest;
    }

    hide() {
        this.page?.classList.add('hide');
        this.ondelete?.();
    }
}
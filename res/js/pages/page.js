class Page {
    constructor(pageView, pageName, requireTest) {
        this.page = pageView;
        this.pageName = pageName;
        this.requireTest = requireTest;
    }

    hide() {
        this.page?.classList.add('hide');
        this.ondelete?.();
    }
}
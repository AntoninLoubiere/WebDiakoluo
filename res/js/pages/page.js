/**
 * The abstract class that represent a UI panel that can be shown.
 */
class Page {
    /**
     * Create a new page.
     * @param {HTMLElement} pageView The page element to show / hide
     * @param {string} pageName The name of the page
     * @param {boolean} requireTest If it required  test to be loaded
     */
    constructor(pageView, pageName, requireTest) {
        this.page = pageView;
        this.pageName = pageName;
        this.requireTest = requireTest;
    }

    /**
     * Hide the page.
     */
    hide() {
        this.page?.classList.add('hide');
        this.ondelete?.();
    }

    /**
     * When the page is loaded.
     */
    onload() {
        I18N.updatePageTitle('title-' + this.pageName);
        this.page.classList.remove('hide');
    }
}
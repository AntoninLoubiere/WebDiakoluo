const settingsPageView = document.getElementById('settings-page');

/**
 * The settings page
 */
class SettingsPage extends Page {
    /**
     * Create a new settings page.
     */
    constructor() {
        super(settingsPageView, 'settings', false);
    }

    /**
     * When the page is loaded
     */
    onload() {
        super.onload();
    }
}

PAGES.settings = new SettingsPage();

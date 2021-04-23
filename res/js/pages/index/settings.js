const settingsPageView = document.getElementById('settings-page');
const settingsPagePanels = {
    general: {
        view: document.getElementById('settings-panel-general'), 
        button: document.getElementById('settings-nav-general')
    },
    appearance: {
        view: document.getElementById('settings-panel-appearance'), 
        button: document.getElementById('settings-nav-appearance')
    },
    // sync: {
    //     view: document.getElementById('settings-panel-sync'), 
    //     button: document.getElementById('settings-nav-sync')
    // }
}

const settingsPageVersion = document.getElementById('settings-version');
const settingsPageVerifyUpdate = document.getElementById('settings-get-version');
const settingsPageLastUpdatePanel =  document.getElementById('settings-verify-update-panel');
const settingsPageLastUpdate =  document.getElementById('settings-last-update');
const settingsPageUpdate = document.getElementById('settings-update');
const settingsPageUpdateStatus = document.getElementById('settings-update-status');

/**
 * The settings page
 */
class SettingsPage extends Page {
    /**
     * Create a new settings page.
     */
    constructor() {
        super(settingsPageView, 'settings', false);

        this.activePanel = null;

        const keys = Object.keys(settingsPagePanels);
        for (let i = 0; i < keys.length; i++) {
            const panelName = keys[i];
            settingsPagePanels[panelName].button.onclick = () => this.onNavButtonClick(panelName);
        }

        I18N.initAsyncFunc.then(() => settingsPageVersion.textContent = I18N.getTranslation('version') + ' (' + I18N.getTranslation('id') + ')');
        settingsPageVerifyUpdate.onclick = this.verifyUpdate.bind(this);
        settingsPageUpdate.onclick = this.updateButton.bind(this);
    }

    /**
     * When the page is loaded
     */
    onload() {
        super.onload();
        this.onupdate();
    }

    /**
     * When the page is updated
     */
    onupdate() {
        const panel = currentURL.searchParams.get('panel') || 'general';
        const selectedPanel = settingsPagePanels[panel] || settingsPagePanels['general'];
        if (this.activePanel !== this.selectedPanel) {
            if (this.activePanel) {
                this.activePanel.view.classList.add('hide');
                this.activePanel.button.classList.remove('active');
            }
    
            this.activePanel = selectedPanel;
            this.activePanel.view.classList.remove('hide');
            this.activePanel.button.classList.add('active');  
        }

    }

    /**
     * When a nav button is clicked.
     * @param {string} panelName The name of the panel to go
     */
    onNavButtonClick(panelName) {
        currentURL.searchParams.set('panel', panelName);
        history.pushState({}, '', currentURL);
        this.onupdate();
    }

    /**
     * Verify if there is an update and update the UI (callback of settingsVerifyUpdate)
     */
    async verifyUpdate() {
        try {
            var r = await fetch('/WebDiakoluo/api/last_cache_id.json');
            r = await r.json();
            settingsPageLastUpdatePanel.classList.remove('hide');
            settingsPageLastUpdate.textContent = `${r.version} (${r.id})`
            if (I18N.getTranslation('id') !== r.id) {
                settingsPageLastUpdate.classList.add('important-font')
            } else {
                settingsPageLastUpdate.classList.remove('important-font')
            }
        } catch {
            settingsPageLastUpdatePanel.classList.remove('hide');
            settingsPageLastUpdate.textContent = I18N.getTranslation('no-connection');
            settingsPageLastUpdate.classList.add('important-font')
        }
    }

    /**
     * Update the button
     */
    async updateButton() {
        settingsPageUpdateStatus.classList.remove('important-font');
        settingsPageUpdateStatus.textContent = I18N.getTranslation('settings-updating');
        try {
            if (serviceWorkerRegistration.update) {
                await serviceWorkerRegistration.update();
            } else {
                await serviceWorkerRegistration.unregister();
            }
            settingsPageUpdateStatus.textContent = I18N.getTranslation('settings-updated');
            setTimeout(() => document.location = document.location, 3000);
        } catch (e) {
            console.error("[Service Worker] Can't update", e);
            settingsPageUpdateStatus.classList.add('important-font')
            settingsPageUpdateStatus.textContent = I18N.getTranslation('settings-cant-update');
        }
    }
}

PAGES.settings = new SettingsPage();

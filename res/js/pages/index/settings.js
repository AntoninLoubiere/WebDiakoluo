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

const settingsPageThemeLightLabel = document.getElementById('settings-theme-light-label');
const settingsPageThemeLight = document.getElementById('settings-theme-light');
const settingsPageThemeAutoLabel = document.getElementById('settings-theme-auto-label');
const settingsPageThemeAuto = document.getElementById('settings-theme-auto');
const settingsPageThemeDarkLabel = document.getElementById('settings-theme-dark-label');
const settingsPageThemeDark = document.getElementById('settings-theme-dark');

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

        settingsPageThemeLight.onchange = () => this.setThemeRadio('light');
        settingsPageThemeAuto.onchange = () => this.setThemeRadio('auto');
        settingsPageThemeDark.onchange = () => this.setThemeRadio('dark');
        this.setThemeRadio();
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
     * Set the theme or update if no theme is passed.
     * @param {string} [theme] The theme to set
     */
    setThemeRadio(theme) {
        var selected = getSelectedTheme();
        if (selected !== theme) {
            if (theme) {
                setSelectedTheme(theme);
                switch (selected) {
                    case 'light':
                        settingsPageThemeLightLabel.classList.remove('selected');
                        settingsPageThemeLight.checked = false;
                        break;
        
                    case 'auto':
                        settingsPageThemeAutoLabel.classList.remove('selected');
                        settingsPageThemeAuto.checked = false;
                        break;
        
                    case 'dark':
                        settingsPageThemeDarkLabel.classList.remove('selected');
                        settingsPageThemeDark.checked = false;
                        break;
                }
            } else {
                theme = selected;
            }
            switch (theme) {
                case 'light':
                    settingsPageThemeLightLabel.classList.add('selected');
                    settingsPageThemeLight.checked = true;
                    break;
    
                case 'auto':
                    settingsPageThemeAutoLabel.classList.add('selected');
                    settingsPageThemeAuto.checked = true;
                    break;
    
                case 'dark':
                    settingsPageThemeDarkLabel.classList.add('selected');
                    settingsPageThemeDark.checked = true;
                    break;
            }
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

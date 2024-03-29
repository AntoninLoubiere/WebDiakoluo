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
    sync: {
        view: document.getElementById('settings-panel-sync'), 
        button: document.getElementById('settings-nav-sync')
    }
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

const settingsPageSyncForm = document.getElementById('settings-sync-form');
const settingsPageSyncHost = document.getElementById('settings-sync-host');
const settingsPageSyncUsername = document.getElementById('settings-sync-username');
const settingsPageSyncPassword = document.getElementById('settings-sync-password');
const settingsPageStatusText = document.getElementById('settings-sync-status');

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
        settingsPagePanels.sync.callback = this.onSyncPanel.bind(this);

        I18N.initAsyncFunc.then(() => settingsPageVersion.textContent = I18N.getTranslation('version') + ' (' + I18N.getTranslation('id') + ')');
        settingsPageVerifyUpdate.onclick = this.verifyUpdate.bind(this);
        settingsPageUpdate.onclick = this.updateButton.bind(this);

        settingsPageThemeLight.onchange = () => this.setThemeRadio('light');
        settingsPageThemeAuto.onchange = () => this.setThemeRadio('auto');
        settingsPageThemeDark.onchange = () => this.setThemeRadio('dark');
        this.setThemeRadio();

        settingsPageSyncForm.onsubmit = this.onSyncSubmit.bind(this);
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

            selectedPanel.callback?.();
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
     * When the sync panel is loaded.
     */
    onSyncPanel() {
        if (SyncManager.fetchManager.length > 0) {
            var fetchManager = SyncManager.fetchManager[0];
            settingsPageSyncHost.value =  fetchManager.host + '/';
            settingsPageSyncUsername.value = fetchManager.credentials?.username || "";
            settingsPageSyncPassword.value = fetchManager.credentials?.password || "";
        } else {
            settingsPageSyncHost.value = "";
            settingsPageSyncUsername.value = "";
            settingsPageSyncPassword.value = "";
        }
        settingsPageStatusText.setAttribute("key", "");
        settingsPageStatusText.textContent = "";
    }

    /**
     * When the sync form is submitted.
     * @param {*} event the event of the submit
     */
    async onSyncSubmit(event) {
        event.preventDefault();
        var host = settingsPageSyncHost.value;
        var username = settingsPageSyncUsername.value;
        var password = settingsPageSyncPassword.value;

        if (!host) {
            SyncManager.setSyncAccount([]);
            this.onSyncPanel();
            settingsPageStatusText.setAttribute('key', 'settings-sync-deleted');
            return;
        }

        if (!host.startsWith('http')) {
            host = "http://" + host;
        }
        try {
            var url = new URL(host);
            if (url.protocol !== "http:" && url.protocol !== "https:") throw TypeError();
            host = url.toString();
            if (host.endsWith('/')) {
                host = host.substring(0, host.length - 1);
            }
        } catch {
            settingsPageSyncHost.focus();
            return;
        }
        
        try {
            await SyncManager.fetchManager[0]?.authFetch('/logout');
        } catch {}

        var s = new SyncFetchManager(host, {username: username, password: password});
        settingsPageStatusText.setAttribute('key', 'settings-sync-loading');
        settingsPageStatusText.classList.remove('important-font');
        s.authFetch('/test').then(() => {
            SyncManager.setSyncAccount([s]);
            SyncManager.update();
            this.onSyncPanel();
            settingsPageStatusText.setAttribute('key', 'settings-sync-success');
        }).catch((error) => {
            console.error(error);
            if (error.error) {
                settingsPageStatusText.setAttribute('key', 'settings-sync-error');
            } else {
                settingsPageStatusText.setAttribute('key', 'settings-sync-login-failed');
            }
            settingsPageStatusText.classList.add('important-font');
        });        
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
        settingsPageUpdateStatus.textContent = I18N.getTranslation('settings-downloading');
        try {
            var swRegistration = await navigator.serviceWorker.getRegistration();
            if (swRegistration.update) {
                await swRegistration.update();
                if (swRegistration.installing) {
                    this.updateOnInstalling(swRegistration.installing);
                } else if (swRegistration.waiting) {
                    this.updateOnWaiting(swRegistration.waiting);
                } else {
                    settingsPageUpdateStatus.textContent = I18N.getTranslation('settings-no-update');
                }
            } else {
                await swRegistration.unregister();
                updateOnUpdated();
            }
        } catch (e) {
            this.updateFailed(e);
        }
    }

    /**
     * When a worker is installing during the update.
     * @param {ServiceWorker} worker the service worker that is installing
     */
    updateOnInstalling(worker) {
        settingsPageUpdateStatus.textContent = I18N.getTranslation('settings-installing');
        worker.onstatechange = e => {
            const state = e.target.state;
            if (state === 'activating' || state === 'installed') {
                this.updateOnWaiting(worker);
                worker.onstatechange = null;
            } else if (state === 'activated') {
                this.updateOnActivated();
            } else if (state === 'redundant') {
                this.updateFailed(worker);
            }
        }
    }

    /**
     * When a worker is waiting during the update.
     * @param {ServiceWorker} worker the service worker that is waiting
     */
    updateOnWaiting(worker) {
        worker.postMessage({action: 'skipWaiting'});
        this.updateOnActivated();
    }

    /**
     * When a worker is activated during the update.
     * @param {ServiceWorker} worker the service worker that is activated
     */
    updateOnActivated() {
        settingsPageUpdateStatus.textContent = I18N.getTranslation('settings-updated');
        setTimeout(() => document.location.reload(), 3000);
    }

    /**
     * When an update failed.
     * @param {*} e the error to print
     */
    updateFailed(e) {
        console.error("[Service Worker] Can't update", e);
        settingsPageUpdateStatus.classList.add('important-font')
        settingsPageUpdateStatus.textContent = I18N.getTranslation('settings-cant-update');
    }
}

PAGES.settings = new SettingsPage();

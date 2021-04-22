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
}

PAGES.settings = new SettingsPage();

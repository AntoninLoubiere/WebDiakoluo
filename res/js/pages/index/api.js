const loadingPage = document.getElementById('loading-page');

class API_PAGE extends Page {
    constructor() {
        super(loadingPage, 'api', false);
    }

    onload() {
        loadingPage.classList.remove('hide');
        if (currentURL.searchParams.get('action') === 'import-url') {
            this.importUrl().catch(e => {
                console.error("Error while adding a test from URL", e);
                backToMain(false);
            });
        } else {
            backToMain(false);
        }
    }

    async importUrl() {
        var host = currentURL.searchParams.get('host');
        if (!host.startsWith("http://") && !host.startsWith("https://")) {
            host = "http://" + host;
        }
        const hostUrl = new URL(host);
        host = hostUrl.toString();
        if (host.endsWith('/')) {
            host = host.substring(0, host.length - 1);
        }

        const serverTestId = currentURL.searchParams.get('id');

        const credentials = {
            username: currentURL.searchParams.get('username'),
            password: currentURL.searchParams.get('password')
        };
        if (!host || !serverTestId) {
            throw new Error("Host or serverTestId not specified.");
        } else {
            var sync = {
                host,
                serverTestId,
                credentials,
                authAccount: SyncManager.LINK
            };
            const syncObject = SyncManager.getSyncFromSync(sync);
            await syncObject.updateTest();
            SyncManager.isSynced = true;
            SyncManager.onVisibilityChange();

            defaultPage.reloadList();

            backToMain(false);
            if (sync.testId) {
                UTILS.viewTestPage(sync.testId);
            }
        }
    }
}

PAGES.api = new API_PAGE();
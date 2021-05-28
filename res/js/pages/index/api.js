class API_PAGE extends Page {
    constructor() {
        super(null, 'api', false);
    }

    onload() {
        if (currentURL.searchParams.get('action') === 'import-url') {
            const URL = currentURL.searchParams.get('url');
        }
        backToMain(false);
    }
}

PAGES.api = new API_PAGE();
/* redirect to the view page of a test */
function viewTestPage(id) {
    currentURL.searchParams.set('page', 'view');
    currentURL.searchParams.set('test', id);
    window.history.pushState({}, 'View page', currentURL);
    loadPage();
}

/* redirect to add a test */
function addTestRedirect() {
    currentURL.searchParams.set('page', 'edit');
    currentURL.searchParams.set('test', 'new');
    window.history.pushState({}, 'Edit page', currentURL);
    loadPage();
}
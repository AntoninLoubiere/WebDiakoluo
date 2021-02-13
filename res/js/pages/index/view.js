const viewPage = document.getElementById('view-page');

const viewPageTitle = [document.getElementById('test-title'), document.getElementById('test-title2')];
const viewPageDescription = document.getElementById('test-description');
const viewPageCreatedDate = document.getElementById('test-created-date');
const viewPageModificationDate = document.getElementById('test-modification-date');

function loadViewPage() {
    currentPage = viewPage;
    for (var i = 0; i < viewPageTitle.length; i++) {
        viewPageTitle[i].textContent = currentTest.title;
    }
    viewPageDescription.textContent = currentTest.description;
    viewPageCreatedDate.textContent = DATE_FORMATER.format(currentTest.createdDate);
    viewPageModificationDate.textContent = DATE_FORMATER.format(currentTest.modificationDate);
    currentPage.classList.remove('hide');

    setPageTitle(currentTest.title);
}
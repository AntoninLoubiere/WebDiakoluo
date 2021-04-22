const navOfflineLogo = document.getElementById('nav-offline');
const navSettings = document.getElementById('nav-settings');

if (navOfflineLogo) {
    if (navigator.onLine) {
        ononlineCallback();
    } else {
        onofflineCallback();
    }
}

async function onNavBarLoadded() {
    await I18N.initAsyncFunc;
    navOfflineLogo = document.getElementById('nav-offline');
    I18N.updatePageTitle();
    if (navigator.onLine) {
        ononlineCallback();
    } else {
        onofflineCallback();
    }
}

function onofflineCallback() {
    navOfflineLogo.classList.remove('hide');
}

function ononlineCallback() {
    navOfflineLogo.classList.add('hide');
}

window.onoffline = onofflineCallback;
window.ononline = ononlineCallback;

navSettings.onclick = function() {
    UTILS.settings();
    navSettings.blur();
}
var navOfflineLogo = document.getElementById('nav-offline');

if (navOfflineLogo) {
    if (navigator.onLine) {
        ononlineCallback();
    } else {
        onofflineCallback();
    }
}

function onNavBarLoadded() {
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
var navOfflineLogo = document.getElementById('nav-offline');

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

    const navSettings = document.getElementById('nav-settings');

    navSettings.onclick = function() {
        UTILS.settings();
        navSettings.blur();
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
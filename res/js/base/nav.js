const navOfflineLogo = document.getElementById('nav-offline');
const navSettings = document.getElementById('nav-settings');

if (navigator.onLine) {
    ononlineCallback();
} else {
    onofflineCallback();
}

navSettings.onclick = function() {
    if (typeof UTILS !== "undefined") UTILS.settings();
    else document.location = '/WebDiakoluo/?page=settings'
    navSettings.blur();
}

function onofflineCallback() {
    navOfflineLogo.classList.remove('hide');
}

function ononlineCallback() {
    navOfflineLogo.classList.add('hide');
}

window.onoffline = onofflineCallback;
window.ononline = ononlineCallback;
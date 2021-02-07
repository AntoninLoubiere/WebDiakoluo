var LANGUAGES = ['en', 'fr'];
var translations = null;
var universal = null;

var languageSelector = document.getElementById("language-selector");

/*
Custom element that hold a translation.
*/
class I18nElement extends HTMLElement {
    static get observedAttributes() { return ['key']; }

    constructor() {
        super();
        this.textContent = this.getAttribute('key');
    }

    /* Update the translation */
    updateI18n() {
        if (universal == null || translations == null) return;

        let key = this.getAttribute("key");
        let tr = translations[key];
        if (tr != undefined) {
            this.innerHTML = tr;
        } else {
            tr = universal[key];
            if (tr == undefined) {
                console.warn("A key isn't available in this language !", key);
                this.innerHTML = key;
            } else {
                this.innerHTML = tr;
            }
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name == 'key' && newValue != null) {
            this.updateI18n();
        }
    }
}

/* Initialise the module */
function initialise() {
    customElements.define('x-i18n', I18nElement);
    let request = new XMLHttpRequest();
    request.open('GET', '/res/translations/universal.json');
    request.responseType = 'json';
    request.send();

    request.onload = function() {
        universal = request.response;
        onSetLang();
    }
    
    let lang = localStorage.getItem("lang");
    if (lang == null) {
        lang = detectLang();
        loadModal('cookies');
    }
    setLang(lang, true);

    let buttons = document.getElementsByClassName("lang");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].onclick = function() {
            let lang = buttons[i].getAttribute("lang");
            setLang(lang, false);
            languageSelector.textContent = buttons[i].textContent;
            localStorage.setItem("lang", lang);
        }
    }
    
}

/* Set a new lang */
function setLang(lang, updateButton) {
    let request = new XMLHttpRequest();
    request.open('GET', '/res/translations/' + lang + '.json');
    request.responseType = 'json';
    request.send();

    request.onload = function() {
        if (request.response == null) {
            if (translations == null) {
                setLang(detectLang());
            }
        } else {
            translations = request.response
            onSetLang();
        }
        
    }

    if (updateButton) {
        let buttons = document.getElementsByClassName("lang");
        for (var i = 0; i < buttons.length; i++) {
            if (buttons[i].getAttribute("lang") == lang) {
                languageSelector.textContent = buttons[i].textContent;
            }
        }
    }
}

/* When the request is receive */
function onSetLang() {
    if (universal != null && translations != null)
        updateAll();
}

/* Update all translations in the page */
function updateAll() {
    let i18n = document.getElementsByTagName('x-i18n');
    for (var i = 0; i < i18n.length; i++) {
        i18n[i].updateI18n();
    }
}

/* Return the lang detected from the navigator */
function detectLang() {
    for (var i = 0; i < navigator.languages.length; i++) {
        for (var j = 0; j < LANGUAGES.length; j++) {
            if (navigator.languages[i].toLowerCase() == LANGUAGES[j] || navigator.languages[i].substring(0, 2).toLowerCase() == LANGUAGES[j]) {
                return LANGUAGES[j];
            }
        }
    }
    return 'en'; // by default return en
}

function cookiesCallback() {
    deleteModal('cookies');
    localStorage.setItem("lang", detectLang());
}

initialise();
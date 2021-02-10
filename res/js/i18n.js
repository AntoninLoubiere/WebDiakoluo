var LANGUAGES = ['en', 'fr'];
var LANGUAGES_BUTTONS = {'en': "&#127468;&#127463; English", 'fr': "&#127467;&#127479; Français"};
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

    let parent = document.getElementById('language-selector-childs');
    for (var i = 0; i < LANGUAGES.length; i++) {
        let lang = LANGUAGES[i];
        let button = document.createElement('div');
        button.classList = ['selector-dropdown-child'];
        button.innerHTML = LANGUAGES_BUTTONS[lang];
        button.setAttribute('lang', lang)
        button.onclick = function() {
            setLang(lang, false);
            languageSelector.textContent = button.textContent;
            localStorage.setItem("lang", lang);
        }
        parent.appendChild(button);
    }

    let lang = localStorage.getItem("lang");
    if (lang == null) {
        lang = detectLang();
        if (document.location.pathname != "/WebDiakoluo/legal.html") loadModal('cookies');
    }
    setLang(lang, true);

    let request = new XMLHttpRequest();
    request.open('GET', '/WebDiakoluo/res/translations/universal.json');
    request.responseType = 'json';
    request.send();

    request.onload = function() {
        universal = request.response;
        onSetLang();
    }
}

/* Set a new lang */
function setLang(lang, updateButton) {
    let request = new XMLHttpRequest();
    request.open('GET', '/WebDiakoluo/res/translations/' + lang + '.json');
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
        languageSelector.textContent = document.querySelector("[lang=" + lang + "]").textContent;
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
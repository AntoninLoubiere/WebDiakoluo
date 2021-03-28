const LANGUAGES = ['en', 'fr'];
const LANGUAGES_BUTTONS = {'en': "&#127468;&#127463; English", 'fr': "&#127467;&#127479; Français"};
const PATH_OFFSET = 13;
const DEFAULT_LANGUAGE = 'en';
const LEGAL_PATH = "/WebDiakoluo/legal.html";
const DATE_FORMATER = new Intl.DateTimeFormat(navigator.language, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
});
const languageSelector = document.getElementById("language-selector");
const exceptTitlePath = ['/WebDiakoluo/', '/WebDiakoluo/index.html'];

var onTranslationReady = null; // set var to null after use

var translations = null;
var universal = null;

/*
Custom element that hold a translation.
*/
class I18nElement extends HTMLElement {
    static get observedAttributes() { return ['key', 'caps']; }

    constructor() {
        super();
        this.textContent = this.getAttribute('key');
    }

    /* Update the translation */
    updateI18n() {
        if (universal == null || translations == null) return;
        var tr = getTranslation(this.getAttribute('key'))
        var caps = this.getAttribute('caps')
        if (caps == 'upper') this.innerHTML = tr.toUpperCase();
        else if (caps == 'lower') this.innerHTML = tr.toLowerCase();
        else this.innerHTML = tr;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name == 'key' && newValue != null || name == 'caps') {
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
            if (document.location.pathname != LEGAL_PATH) localStorage.setItem("lang", lang);
        }
        parent.appendChild(button);
    }

    let lang = localStorage.getItem("lang");
    if (lang == null) {
        lang = detectLang();
        if (document.location.pathname != LEGAL_PATH) loadModal('cookies', [{id: "cookies-accept", onclick: cookiesCallback}]);
    }
    addManifest(lang);
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
            langError(lang);
        } else {
            translations = request.response
            onSetLang();
        }
    }

    request.onerror = function(e) {langError(lang);};

    if (updateButton) {
        languageSelector.textContent = document.querySelector("[lang=" + lang + "]").textContent;
    }
}

/* When the request is receive */
function onSetLang() {
    if (universal != null && translations != null) {
        if (onTranslationReady) {
            onTranslationReady();
            onTranslationReady = null;
        }
        updateAll();
    }
}

/* When an error occur while importing translations */
function langError(lang) {
    console.error("Can't load the language:", lang)
    if (translations == null) {
        let l = detectLang();
        if (l == lang) {
            if (lang == DEFAULT_LANGUAGE) {
                console.error("FATAL ERROR: can't load default language !")
            } else {
                setLang(DEFAULT_LANGUAGE);
            }
        } else {
            setLang(l);                
        }
    }
}

/* get a translations in the current language */
function getTranslation(key) {
    let tr = translations[key];
    if (tr != undefined) {
        return tr;
    } else {
        tr = universal[key];
        if (tr == undefined) {
            console.warn("A key isn't available in this language !", key);
            return key;
        } else {
            return tr;
        }
    }
}

/* Update all translations in the page */
function updateAll() {
    let i18n = document.getElementsByTagName('x-i18n');
    for (var i = 0; i < i18n.length; i++) {
        i18n[i].updateI18n();
    }
    
    updatePageTitleCallback();
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
    return DEFAULT_LANGUAGE; // by default return en
}

/* accept cookies button callback*/
function cookiesCallback() {
    deleteModal('cookies');
    localStorage.setItem("lang", detectLang());
}

function updatePageTitleCallback() {
    if (exceptTitlePath.indexOf(document.location.pathname) < 0) {
        updatePageTitle();
    } else {
        var t = document.getElementById('page-title');
        if (!t.textContent)
            t.textContent = document.title;
    }
}

/* update page title */
function updatePageTitle(id = null) {
    if (translations == null) {
        setTimeout(function () {updatePageTitle(id)}, 100);
        return;
    }
    var title;
    if (id) {
        title = translations[id];
    } else {
        let path = document.location.pathname.substring(PATH_OFFSET);
        title = translations['title-' + path];
        if (title == undefined) {
            title = translations['title-' + path + 'index.html']
            if (title == undefined) {
                title = "";
                console.warn('Title for this page not found:', path)
            }
        }
    }
    setPageTitle(title);
}

/* set the page title */
function setPageTitle(title) {
    var pageTitle = document.getElementById('page-title');
    if (title) {
        document.title = title + " - Diakôluô"
        if (pageTitle) {
            pageTitle.textContent = title;
        }
    } else {
        document.title = "Diakôluô";
        if (pageTitle) {
            pageTitle.textContent = "Diakôluô";
        }
    }
}

function isTranslationsReady() {
    return !(universal == null || translations == null);
}

initialise();
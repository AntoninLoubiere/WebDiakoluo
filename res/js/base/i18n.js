const LANGUAGES = ['en', 'fr'];
const LANGUAGES_BUTTONS = {'en': "&#127468;&#127463; English", 'fr': "&#127467;&#127479; Français"};
const PATH_OFFSET = 13;
const DEFAULT_LANGUAGE = 'en';
const DATE_FORMATTER = new Intl.DateTimeFormat(navigator.language, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
});

const languageSelector = document.getElementById("language-selector");
const EXCEPT_TITLE_PATH = ['/WebDiakoluo/', '/WebDiakoluo/index.html'];

const pageTitleElement = document.getElementById('page-title');

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
        if (I18N.universal == null || I18N.translations == null) return;
        var tr = I18N.getTranslation(this.getAttribute('key'))
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

class I18NClass {

    /* Return the lang detected from the navigator */
    static detectLang() {
        for (var i = 0; i < navigator.languages.length; i++) {
            for (var j = 0; j < LANGUAGES.length; j++) {
                if (navigator.languages[i].toLowerCase() == LANGUAGES[j] || navigator.languages[i].substring(0, 2).toLowerCase() == LANGUAGES[j]) {
                    return LANGUAGES[j];
                }
            }
        }
        return DEFAULT_LANGUAGE; // by default return en
    }

    constructor() {
        this.translations = null;
        this.universal = null;
    }

    /* Initialise the module */
    async initialise() {
        customElements.define('x-i18n', I18nElement);

        const universalFun = this.getUniversal();

        let lang = localStorage.getItem("lang");
        if (lang == null) {
            lang = I18NClass.detectLang();    
        }

        const langFun = this.setLang(lang);

        addManifest(lang);
        this.createLangSelector();
        
        await langFun;
        await universalFun;
        this.updateAll();
    }

    createLangSelector() {
        let parent = document.getElementById('language-selector-childs');
        for (var i = 0; i < LANGUAGES.length; i++) {
            let lang = LANGUAGES[i];
            let button = document.createElement('div');
            button.classList = ['selector-dropdown-child'];
            button.innerHTML = LANGUAGES_BUTTONS[lang];
            button.setAttribute('lang', lang)
            button.tabIndex = 0;
            button.onclick = () => {
                this.setLang(lang, false).then(this.updateAll.bind(this));
                languageSelector.textContent = button.textContent;
                if (cookiesConsent) localStorage.setItem("lang", lang);
            }
            button.onkeydown = onReturnClick;
            parent.appendChild(button);
        }
    }

    /* Set a new lang */
    async setLang(lang, updateButton=true) {
        return new Promise((resolve, reject) => {
            let request = new XMLHttpRequest();
            request.open('GET', '/WebDiakoluo/res/translations/' + lang + '.json');
            request.responseType = 'json';
            request.send();

            request.onload = () => {
                if (request.response == null) {
                    this.langError(lang).then(resolve).catch(reject);
                } else {
                    this.translations = request.response
                    if (updateButton) {
                        languageSelector.textContent = document.querySelector("[lang=" + lang + "]").textContent;
                    }
                    resolve();
                }
            }

            request.onerror = () => this.langError(lang).then(resolve).catch(reject);
        });
    }

    /* load universal translations */
    async getUniversal() {
        return new Promise((resolve, reject) => {
            let request = new XMLHttpRequest();
            request.open('GET', '/WebDiakoluo/res/translations/universal.json');
            request.responseType = 'json';
            request.send();

            request.onload = () => {
                this.universal = request.response;
                console.info("Diakôluô version id :", this.universal['id']);
                resolve();
            }

            request.onerror = reject;
        });
    }

    /* When an error occur while importing translations */
    async langError(lang) {
        console.error("Can't load the language:", lang)
        if (this.translations == null) {
            let l = I18NClass.detectLang();
            if (l == lang) {
                if (lang == DEFAULT_LANGUAGE) {
                    console.error("FATAL ERROR: can't load default language !")
                } else {
                    return await this.setLang(DEFAULT_LANGUAGE);
                }
            } else {
                return await this.setLang(l);                
            }
        }
    }

    /* get a translations in the current language */
    getTranslation(key, warn=true) {
        let tr = this.translations[key];
        if (tr != undefined) {
            return tr;
        } else {
            tr = this.universal[key];
            if (tr == undefined) {
                if (warn) console.warn("A key isn't available in this language !", key);
                return key;
            } else {
                return tr;
            }
        }
    }

    /* Update all translations in the page */
    updateAll() {
        let i18n = document.getElementsByTagName('x-i18n');
        for (var i = 0; i < i18n.length; i++) {
            i18n[i].updateI18n();
        }
        
        this.updatePageTitle();
    }

    /* update page title */
    updatePageTitle(id = null) {
        console.assert(this.translations != null, "Translations aren't loaded yet");
        if (id) {
            this.setPageTitle(this.getTranslation(id));
        } else if (EXCEPT_TITLE_PATH.indexOf(document.location.pathname) < 0) {
            // get the title from the translations list
            var title;
            let path = document.location.pathname.substring(PATH_OFFSET);
            title = this.getTranslation('title-' + path, false);
            if (title == undefined) {
                title = this.getTranslation('title-' + path + 'index.html', false);
                if (title == undefined) {
                    title = "";
                    console.warn('Title for this page not found:', path)
                }
            }
            this.setPageTitle(title);
        } else {
            pageTitleElement.textContent = document.title;
        }
    }

    /* set the page title */
    setPageTitle(title) {
        if (title) {
            document.title = title + " - Diakôluô"
            pageTitleElement.textContent = title;
        } else {
            document.title = "Diakôluô";
            pageTitleElement.textContent = "Diakôluô";
        }
    }
}

const I18N = new I18NClass();
I18N.initAsyncFunc = I18N.initialise();
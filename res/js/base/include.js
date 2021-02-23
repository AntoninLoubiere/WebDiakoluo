/*
Custom element that load a sub-page.
*/
class IncludeElement extends HTMLElement {
    static get observedAttributes() { return ['key']; }

    constructor() {
        super();
    }

    update() {
        let obj = this;
        let key = this.getAttribute('key');
        let request = new XMLHttpRequest();
        request.open('GET', '/WebDiakoluo/res/include/' + key + '.html');
        request.responseType = 'html';
        request.send();

        request.onload = function() {
            obj.innerHTML = request.response;
        }
        request.onerror = function() {
            obj.innerHTML = key;
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name == 'key' && newValue != null) {
            this.update();
        }
    }
}
customElements.define('x-include', IncludeElement);
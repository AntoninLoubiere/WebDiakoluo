/* A class tha hold a modal */
class Modal {
    /* GLOBALS FIELDS */
    static currentModal;
    static modalQueue = [];

    /* load a modal from a file and a list of buttons to bind callbacks */
    static loadModal(id, buttons) {
        var modal = document.createElement('div');
        modal.classList = 'modal hide';
        modal.id = id + '-modal';
        document.body.appendChild(modal);

        document.body.classList.add("hide-scroll");
        return new Promise((resolve, reject) => {
            let request = new XMLHttpRequest();
            request.open('GET', '/WebDiakoluo/res/modals/' + id + '.html');
            request.responseType = 'html';
            request.onload = function() {
                if (request.status == 200) {
                    modal.innerHTML = request.response;
                    if (buttons) {
                        var b;
                        for (var i = 0; i < buttons.length; i++) {
                            b = buttons[i];
                            document.getElementById(b.id).onclick = b.onclick;
                        }
                    }
                    var modalObject = new Modal(modal);
                    if (modal.children[0].classList.contains('no-disimiss')) {
                        modalObject.dismiss = false;
                    }
                    modalObject.show();
                    resolve(modalObject);
                } else {
                    document.body.removeChild(modal);
                    document.body.classList.remove("hide-scroll");
                    reject();
                }
            }
            request.send();
        });
    }

    /* hide a modal */
    static hideModal() {
        Modal.currentModal.hide();
    }

    /* BASE DIALOGS BUILDERS */

    static createModalClose() {
        var e = document.createElement('button', {is: 'modal-close'});
        e.classList = 'modal-close';
        e.textContent = "×";
        return e;
    }

    static createBaseModal(title, description, options) {
        var modal = document.createElement('div');
        modal.classList = 'modal hide';

        var modalContent = document.createElement('div');
        modalContent.classList = 'modal-content';
        if (options?.important) modalContent.classList.add('red');

        var container = document.createElement('header');
        container.textContent = I18N.getTranslation(title);
        if (!options?.noDismiss) container.appendChild(this.createModalClose());
        modalContent.appendChild(container);

        container = document.createElement('main');
        var e = document.createElement('p');
        e.innerHTML = I18N.getTranslation(description);
        container.appendChild(e);
        modalContent.appendChild(container);

        modal.appendChild(modalContent);
        return modal;
    }

    /* show a base modal to confirm an information */
    static showOkModal(title, description, options) {
        return new Promise(resolve => {
            if (options?.showAgain && localStorage.getItem(options?.showAgain) === "true") {
                resolve();
                return;
            }

            var modal = Modal.createBaseModal(title, description, options);
            var container = modal.querySelector("main");

             if (options?.showAgain) {
                var showAgainCheckBox = document.createElement('input');
                showAgainCheckBox.type = 'checkbox';
                container.appendChild(showAgainCheckBox);

                var e = document.createElement('label');
                e.textContent = I18N.getTranslation('dont-show-again');
                container.appendChild(e);
                e.htmlFor = showAgainCheckBox.id = randomId();
             }

            var e = VIEW_UTILS.createImageButton('ok', true, null, {is: "modal-close"});
            container.appendChild(e);
            if (options?.important) e.classList.add('red')

            document.body.appendChild(modal);

            var modalObject = new Modal(modal, !options?.noDismiss);
            modalObject.onhide = () => {
                modalObject.delete();
                if (showAgainCheckBox && cookiesConsent) 
                    localStorage.setItem(options?.showAgain, showAgainCheckBox.checked);
                resolve();
            };
            modalObject.show();
        });
    }

    /* show a base modal to confirm an information */
    static showActionModal(title, description, button, options) {
        return new Promise((resolve, reject) => {
            var notResolved = true;
            var modal = Modal.createBaseModal(title, description, options);

            var container = modal.querySelector('main');

            var e = VIEW_UTILS.createImageButton(button?.name || 'ok', true, button?.icon);
            e.onclick = () => {
                notResolved = false;
                Modal.hideModal();
                resolve(true);
            }
            container.appendChild(e);

            if (options?.important) e.classList.add('red')


            e = VIEW_UTILS.createImageButton(options?.cancelButton?.name || 'cancel', false, options?.cancelButton?.icon, {is: 'modal-close'});
            container.appendChild(e);

            document.body.appendChild(modal);

            var modalObject = new Modal(modal, !(options.noBack || options?.noDismiss));
            modalObject.onhide = () => {
                modalObject.delete();
                if (notResolved) resolve(false);
            };
            modalObject.show();
        });
    }

    /* MODALS CLASSES */

    constructor(modal, do_back=true) {
        this.modal = modal;
        this.dismiss = do_back;
    }

    /* show the modal */
    show(erasePrevious=false, addHistory=true) {
        if (Modal.currentModal) {
            if (erasePrevious) {
                Modal.currentModal.hide(false);
            } else {
                Modal.modalQueue.push(this);
                return;
            }
        }
        Modal.currentModal = this;
        this.onshow?.();
        this.modal.classList.remove('hide');
        document.body.classList.add("hide-scroll");
        if (addHistory && this.dismiss) history.pushState({}, "Modal", currentURL || null);
    }

    /* hide the modal */
    hide(back=true) {
        this.modal.classList.add('hide');
        document.body.classList.remove("hide-scroll");
        Modal.currentModal = null;
        this.onhide?.();
        if (back && this.dismiss) history.back();

        var modal = Modal.modalQueue.shift();
        if (modal) modal.show();
    }

    /* delete the modal from the document */
    delete() {
        if (this ===  Modal.currentModal) Modal.hideModal();
        document.body.removeChild(this.modal);
    }
}

class ModalClose extends HTMLButtonElement {
  constructor() {
    super();
    this.addEventListener("click", Modal.hideModal);
  }
}

customElements.define('modal-close', ModalClose, { extends: 'button' });
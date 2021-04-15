/* A class tha hold a modal */
class Modal {
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
                        modalObject.noDisimiss = true;
                    }
                    Modal.showModal(modalObject);
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
        Modal.currentModal.modal.classList.add('hide');
        document.body.classList.remove("hide-scroll");
        var modal = Modal.currentModal;
        Modal.currentModal = null;
        modal.onhide?.();

        modal = Modal.modalQueue.shift();
        if (modal) Modal.showModal(modal);
    }

    /* show a modal */
    static showModal(modal) {
        if (Modal.currentModal) {
            Modal.modalQueue.push(modal);
        } else {
            Modal.currentModal = modal;
            Modal.currentModal.onshow?.();
            Modal.currentModal.modal.classList.remove('hide');
            document.body.classList.add("hide-scroll");
        }
    }

    /* callback for modal-show checkbox */
    static modalShowCheck(id) {
        console.log(document.getElementById('modal-show').checked);
        if (cookiesConsent) localStorage.setItem(id, document.getElementById('modal-show').checked);
    }

    constructor(modal) {
        this.modal = modal;
    }

    /* show the modal */
    show() {
        Modal.showModal(this);
    }

    /* hide the modal */
    hide() {
        Modal.hideModal(this);
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
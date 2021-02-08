/* load a modal from a file */
function loadModal(id) {
    let request = new XMLHttpRequest();
    request.open('GET', '/res/modals/' + id + '.html');
    request.responseType = 'html';
    request.send();

    var modal = document.createElement('div');
    modal.classList = ['modal'];
    modal.id = id + '-modal';
    document.body.appendChild(modal);

    document.body.classList.add("hide-scroll");

    request.onload = function() {
        if (request.status == 200) {
            modal.innerHTML = request.response;
        } else {
            deleteModal(id);
        }
    }
}

/* hide a modal */
function hideModal(id) {
    document.getElementById(id + "-modal").classList.add('hide');
    document.body.classList.remove("hide-scroll");
}

/* show a modal */
function showModal(id) {
    document.getElementById(id + "-modal").classList.remove('hide');
    document.body.classList.add("hide-scroll");
}

/* delete a modal from the document */
function deleteModal(id) {
    hideModal(id);
    document.body.removeChild(document.getElementById(id + '-modal'))
}

/* callback for modal-show checkbox */
function modalShowCheck(id) {
    localStorage.setItem(id, document.getElementById('modal-show').checked);
}
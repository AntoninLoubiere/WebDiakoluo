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
        modal.innerHTML = request.response;
    }
}

function hideModal(id) {
    document.getElementById(id + "-modal").classList.add('hide');
    document.body.classList.remove("hide-scroll");
}

function showModal(id) {
    document.getElementById(id + "-modal").classList.remove('hide');
    document.body.classList.add("hide-scroll");
}

function deleteModal(id) {
    hideModal(id);
    document.body.removeChild(document.getElementById(id + '-modal'))
}
if (navigator.storage && navigator.storage.persist) {

} else {
    if (localStorage.getItem('modal-persist-c-storage') != "true") {
        loadModal('persist-storage-c-warning');
    }
}
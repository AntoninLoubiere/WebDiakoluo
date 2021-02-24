/* Get a boolean view, it is the view element of the check box */
function booleanView(bool, name) {
    var span = document.createElement('span');
    span.classList = bool ? ['boolean-true'] : ['boolean-false'];
    span.textContent = name;
    return span;
}
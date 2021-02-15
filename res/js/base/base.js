/* remove all children of a DOM element*/
function removeAllChildren(view) {
    while (view.children.length) {
        view.removeChild(view.children[0]);
    }
}
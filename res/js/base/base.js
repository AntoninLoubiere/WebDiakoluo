/* remove all children of a DOM element*/
function removeAllChildren(view) {
    while (view.children.length) {
        view.removeChild(view.children[0]);
    }
}

/* clamp a value between a maximum and a minimum */
function clamp(value, mini, maxi) {
    if (value >= maxi) {
        return maxi;
    } else if (value <= mini) {
        return mini;
    } else {
        return value;
    }
}
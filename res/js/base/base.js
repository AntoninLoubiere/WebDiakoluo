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

/* get a random number in [0, maxi[ */
function randint(maxi) {
    return Math.floor(Math.random() * maxi);
}

/* get a list of n numbers between 0 and maxi all unique. Maxi isn't include */
function randomUniqueNumberList(n, maxi) {
    if (n <= maxi) {
        var arr = [];
        var r;
        while (arr.length < n) {
            r = Math.floor(Math.random() * maxi);
            if (arr.indexOf(r) === -1)
                arr.push(r);
        }
        return arr;
    } else {
        throw new Error("Infinite loop warning !");
    }
}
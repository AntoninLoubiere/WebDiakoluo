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

/* get a random id */
function randomId() {
    return Math.random().toString(36).substr(2, 9);
}

/* get if str starts with start (ignoring spaces) */
function startsWithIgnoreSpace(str, start) {
    var j = 0;
    var c;
    for (var i = 0; i < str.length; i++) {
        c = str[i];
        if (c === start[j]) {
            if (++j >= start.length)
                return true;
        } else if (c !== ' ' && c !== '\n' && c !== '\t' && c !== '\r') {
            return false;
        }
    }
    return false;
}

/* get if str ends with end (ignoring spaces) */
function endsWithIgnoreSpace(str, end) {
    var j = end.length - 1;
    var c;
    for (var i = str.length - 1; i >= 0 ; i--) {
        c = str[i];
        if (c === end[j]) {
            if (--j < 0)
                return true;
        } else if (c !== ' ' && c !== '\n' && c !== '\t' && c !== '\r') {
            return false;
        }
    }
    return false;
}

if('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/WebDiakoluo/sw.js', {scope: '/WebDiakoluo/'});
}
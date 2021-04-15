const LEGAL_PATH = "/WebDiakoluo/legal.html";
var cookiesConsent = false;

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

/* get a array of n int in a random order */
function randomShuffledNumberList(n) {
    var arr = [];
    for (var i = 0; i < n; i++) {
        arr.push(i);
    }

    var temp;
    var from;
    var to;
    for (var i = 0, max = n - 1; i < max; i++) {
        from = Math.floor(Math.random() * n);
        to = Math.floor(Math.random() * n);
        temp = arr[from];
        arr[from] = arr[to];
        arr[to] = temp;
    }

    return arr;
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

/* add the manifest */
function addManifest(lang) {
    var l = document.createElement('link');
    l.rel = "manifest";
    l.href = "/WebDiakoluo/manifests/" + lang + '.webmanifest';
    document.head.appendChild(l);
}

/* if the keypress is return redirect to on click */
function onReturnClick(event) {
    if (event.keyCode === KeyboardEvent.DOM_VK_RETURN) {
        event.target.click();
    }
}

if('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/WebDiakoluo/sw.js', {scope: '/WebDiakoluo/'});
}

// verify cookies
function verifyCookies() {
    /* accept cookies button callback*/
    function cookiesCallback() {
        Modal.currentModal.delete();
        localStorage.setItem("lang", I18NClass.detectLang());
        cookiesConsent = true;
    }

    cookiesConsent = Boolean(localStorage.getItem("lang"));

    if (!cookiesConsent && document.location.pathname != LEGAL_PATH) {
        Modal.loadModal('cookies', [{id: "cookies-accept", onclick: cookiesCallback}]);
    }
}

I18N.initAsyncFunc.then(verifyCookies);
/* A navigation bar */
class NavigationBar {

    /* create a nav button. Parameters: right if it is right aligned and max if it is last or first button*/
    static createNavButton(right, max) {
        var e = document.createElement('button');
        e.classList.add('nav-button');
        e.classList.add('nav-' + (right ? 'right' : 'left') + (max ? '-max' : ''));

        return e;
    }

    /* create a navigation bar in the parent and with optionnal buttons (array of object {className, id}) */
    constructor(parent, buttons) {
        this.status = 0; // status represent disabled buttons 0: none, 1: left, 2: right

        var parentDiv = document.createElement('div');
        parentDiv.classList.add('nav-bar');

        this.first = NavigationBar.createNavButton(false, true);
        this.first.onclick = e => this.onfirst?.(e);

        this.previous = NavigationBar.createNavButton(false, false);
        this.previous.onclick = e => this.onprevious?.(e);

        this.next = NavigationBar.createNavButton(true, false);
        this.next.onclick = e => this.onnext?.(e);

        this.last = NavigationBar.createNavButton(true, true);
        this.last.onclick = e => this.onlast?.(e);

        var div = document.createElement('div');
        div.classList = 'nav-div';

        div.appendChild(this.first);
        div.appendChild(this.previous);
        parentDiv.appendChild(div);

        if (buttons) {
            div = document.createElement('div');

            var b;
            var e;
            for (var i = 0; i < buttons.length; i++) {
                b = buttons[i];
                e = document.createElement('button');
                e.classList.add('nav-button');
                e.classList.add(b.className);
                e.onclick = b.onclick;

                div.appendChild(e)
            }

            parentDiv.appendChild(div);
        }

        div = document.createElement('div');
        div.classList = 'nav-div';

        div.appendChild(this.next);
        div.appendChild(this.last);
        parentDiv.appendChild(div);

        parent.appendChild(parentDiv);
    }

    updateStatus(status) {
        if (status !== this.status) {
            if (this.status === 1) {
                this.first.classList.remove('disabled');
                this.previous.classList.remove('disabled');
            } else if (this.status === 2) {
                this.last.classList.remove('disabled');
                this.next.classList.remove('disabled');
            }

            this.status = status;

            if (this.status === 1) {
                this.first.classList.add('disabled');
                this.previous.classList.add('disabled');
            } else if (this.status === 2) {
                this.last.classList.add('disabled');
                this.next.classList.add('disabled');
            }
        }
    }
}

/* A next and a previous buttons on the right and the left of the screen */
class GlobalNavigation {

    /* create a nav button. Parameters: right if it is right aligned and max if it is last or first button*/
    static createNavButton(right) {
        var e = document.createElement('button');
        e.classList.add('global-nav-button');
        e.classList.add('global-nav-' + (right ? 'right' : 'left'));

        return e;
    }

    /* create a navigation global in the parent */
    constructor(parent) {
        this.status = 0; // status represent disabled buttons 0: none, 1: left, 2: right

        this.previous = GlobalNavigation.createNavButton(false);
        this.previous.onclick = e => {this.previous.blur();this.onprevious?.(e)};

        this.next = GlobalNavigation.createNavButton(true);
        this.next.onclick = e => {this.next.blur();this.onnext?.(e)};

        parent.appendChild(this.previous);
        parent.appendChild(this.next);
    }

    updateStatus(status) {
        if (status !== this.status) {
            if (this.status === 1) {
                this.previous.classList.remove('disabled');
            } else if (this.status === 2) {
                this.next.classList.remove('disabled');
            }

            this.status = status;

            if (this.status === 1) {
                this.previous.classList.add('disabled');
            } else if (this.status === 2) {
                this.next.classList.add('disabled');
            }
        }
    }
}
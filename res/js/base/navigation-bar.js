/**
 * A navigation bar
 */
class NavigationBar {

    /**
     * Create a navigation button.
     * @param {boolean} right if the button to crate is at the right
     * @param {boolean} max if the button to create is a max button (first or last button)
     * @returns {HTMLButtonElement} the button element created
     */
    static createNavButton(right, max) {
        var e = document.createElement('button');
        e.classList.add('nav-button');
        e.classList.add('nav-' + (right ? 'right' : 'left') + (max ? '-max' : ''));

        return e;
    }

    /**
     * Create a nav bar.
     * @param {HTMLElement} parent the parent which will receive the navigation bar
     * @param {Object[]} [buttons] a list of objects that represent buttons to add in the middle of the bar
     * @param {string} buttons[].className the class to add for the button
     * @param {function} [buttons[].onclick] the button onclick event callback
     */
    constructor(parent, buttons) {
        this.lowerBound = false;
        this.upperBound = false;

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

    
    /**
     * Update the UI when the page is updated and to show to the user that it is at a bound.
     * @param {boolean} lowerBound if it is at the lower bound
     * @param {boolean} upperBound if it is at the upper bound
     */
    updateStatus(lowerBound, upperBound) {
        if (lowerBound !== this.lowerBound) {
            if (lowerBound) {
                this.first.classList.add('disabled');
                this.previous.classList.add('disabled');
            } else {
                this.first.classList.remove('disabled');
                this.previous.classList.remove('disabled');
            }
            this.lowerBound = lowerBound;
        }

        if (upperBound !== this.upperBound) {
            if (upperBound) {
                this.last.classList.add('disabled');
                this.next.classList.add('disabled');
            } else {
                this.last.classList.remove('disabled');
                this.next.classList.remove('disabled');
            }
            this.upperBound = upperBound;
        }
    }
}

/**
 * A next and a previous buttons on the right and the left of the screen.
 */
class GlobalNavigation {

    /**
     * Create a nav bar button.
     * @param {Boolean} right if the button is shown at the right
     * @returns {HTMLButtonElement} the button element created
     */
    static createNavButton(right) {
        var e = document.createElement('button');
        e.classList.add('global-nav-button');
        e.classList.add('global-nav-' + (right ? 'right' : 'left'));

        return e;
    }

    /**
     * Create a global bar.
     * @param {HTMLElement} parent the parent that will receive the global bar
     */
    constructor(parent) {
        this.upperBound = false;
        this.lowerBound = false;

        this.previous = GlobalNavigation.createNavButton(false);
        this.previous.onclick = e => {this.previous.blur();this.onprevious?.(e)};

        this.next = GlobalNavigation.createNavButton(true);
        this.next.onclick = e => {this.next.blur();this.onnext?.(e)};

        parent.appendChild(this.previous);
        parent.appendChild(this.next);
    }

    /**
     * Update the UI when the page is updated and to show to the user that it is at a bound.
     * @param {boolean} lowerBound if it is at the lower bound
     * @param {boolean} upperBound if it is at the upper bound
     */
     updateStatus(lowerBound, upperBound) {
        if (lowerBound !== this.lowerBound) {
            if (lowerBound) {
                this.previous.classList.remove('disabled');
            } else {
                this.previous.classList.add('disabled');
            }
            this.lowerBound = lowerBound;
        }

        if (upperBound !== this.upperBound) {
            if (upperBound) {
                this.next.classList.remove('disabled');
            } else {
                this.next.classList.add('disabled');
            }
            this.upperBound = upperBound;
        }
    }
}
class NavigationBar {

    /* create a nav button. Parameters: right if it is right aligned and max if it is last or first button*/
    static createNavButton(right, max) {
        var e = document.createElement('button');
        e.classList.add('navigation-button');
        if (right) {
            e.classList.add('right');
            e.textContent = max ? ">>" : ">";
        } else {
            e.textContent = max ? "<<" : "<";
        }

        return e;
    }

    constructor(parent) {
        this.first = NavigationBar.createNavButton(false, true);
        this.first.onclick = e => this.onfirst?.(e);

        this.previous = NavigationBar.createNavButton(false, false);
        this.previous.onclick = e => this.onprevious?.(e);

        this.next = NavigationBar.createNavButton(true, false);
        this.next.onclick = e => this.onnext?.(e);

        this.last = NavigationBar.createNavButton(true, true);
        this.last.onclick = e => this.onlast?.(e);

        parent.appendChild(this.first);
        parent.appendChild(this.previous);
        parent.appendChild(this.last); // reverse because of right
        parent.appendChild(this.next);
    }
}
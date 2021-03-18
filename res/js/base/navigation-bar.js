class NavigationBar {

    /* create a nav button. Parameters: right if it is right aligned and max if it is last or first button*/
    static createNavButton(right, max) {
        var e = document.createElement('button');
        e.classList.add('nav-button');
        e.classList.add('nav-' + (right ? 'right' : 'left') + (max ? '-max' : ''));

        return e;
    }

    constructor(parent) {
        this.status = 0; // status represent disabled buttons 0: none, 1: left, 2: right

        var div = document.createElement('div');
        div.classList.add('nav-bar');

        this.first = NavigationBar.createNavButton(false, true);
        this.first.onclick = e => this.onfirst?.(e);

        this.previous = NavigationBar.createNavButton(false, false);
        this.previous.onclick = e => this.onprevious?.(e);

        this.next = NavigationBar.createNavButton(true, false);
        this.next.onclick = e => this.onnext?.(e);

        this.last = NavigationBar.createNavButton(true, true);
        this.last.onclick = e => this.onlast?.(e);


        div.appendChild(this.first);
        div.appendChild(this.previous);
        div.appendChild(this.last); // reverse because of right
        div.appendChild(this.next);

        parent.appendChild(div);
    }

    updateStatus(status) {
        console.log(status);
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
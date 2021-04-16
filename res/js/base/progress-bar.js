class ProgressBar extends HTMLElement {
    constructor() {
        super();
        this.innerDiv = document.createElement('div');
        this.innerDiv.classList = "progress-bar-inner";
        this.appendChild(this.innerDiv);

        this.textDiv = document.createElement('div');
        this.textDiv.classList = "progress-bar-text";
        this.appendChild(this.textDiv);

        this.setProgress(0); // initialise progress
    }

    /* set the progress to show */
    setProgress(value, disableAnimation=false) {
        if (disableAnimation) {
            this.innerDiv.style.transition = 'none';
            this.innerDiv.style.width = value * 100 + '%';
            setTimeout(() => this.innerDiv.style.transition = '', 100); // if no timeout, it could be ignored.
        } else {
            this.innerDiv.style.width = value * 100 + '%';
        }
    }

    /* set the text to show inside */
    setText(text) {
        this.textDiv.textContent = text;
    }
}

customElements.define('progress-bar', ProgressBar);

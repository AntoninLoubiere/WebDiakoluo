class Test {
    constructor(title = "", description = "") {
        this.title = title;
        this.description = description;
        this.createDate = new Date();
        this.lastModficationDate = new Date();
    }

    getHeader() {
        return {title: this.title, description: this.description, playable: this.isPlayable()};
    }

    isPlayable() {
        return true; // TODO
    }
}
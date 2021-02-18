class Test {
    /* cast an object to Test. / Add functions to the object*/
    static cast(test) {
        var nb_c = test.columns.length;
        for (var i = 0; i < test.data.length; i++) {
            if (test.data[i].length != nb_c) {
                throw new Error("Data length isn't the same as columns");
            }
        }

        var c = [];
        for (var i = 0; i < test.columns.length; i++) {
            c.push(Column.cast(test.columns[i]));
        }
        test.columns = c;

        return Object.assign(new Test(), test);
    }

    /* construct an object, if first param is null, don't create any fields */
    constructor(title, description = "") {
        if (title != null) {
            this.title = title;
            this.description = description;
            this.createDate = new Date();
            this.lastModficationDate = new Date();
            this.columns = [];
            this.data = [];
        }
    }

    /* get the header of the test*/
    getHeader() {
        return {title: this.title, description: this.description, playable: this.isPlayable(), id: this.id};
    }

    /* get if the test is playable */
    isPlayable() {
        return true; // TODO
    }

    registerModificationDate() {
        this.lastModficationDate = new Date();
    }
}
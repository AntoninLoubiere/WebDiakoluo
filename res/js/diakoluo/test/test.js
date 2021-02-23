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
            this.lastModificationDate = new Date();
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
        return this.columns.length > 1 && this.data.length > 1;
    }

    /* set the last modification date to now */
    registerModificationDate() {
        this.lastModificationDate = new Date();
    }

    /* add a column return the index of the column added*/
    addColumn(column) {
        for (var i = 0; i < this.data.length; i++) {
            this.data[i].push(column.getDefaultValue());
        }
        return this.columns.push(column) - 1;
    }

    /* remove a column */
    removeColumn(index) {
        for (var i = 0; i < this.data.length; i++) {
            this.data[i].splice(index, 1);
        }

        this.columns.splice(index, 1);
    }

    /* Add a data and return the index of the item added */
    addData() {
        var d = [];
        for (var i = 0; i < this.columns.length; i++) {
            d.push(this.columns[i].getDefaultValue());
        }
        return this.data.push(d) - 1;
    }

    /* remove a test */
    removeData(index) {
        this.data.splice(index, 1);
    }
}
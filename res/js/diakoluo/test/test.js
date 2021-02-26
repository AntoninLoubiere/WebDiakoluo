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

    static import(test) {
        if (typeof test?.title !== "string" || 
            typeof test.description !== "string" ||
            !Array.isArray(test.columns) ||
            !Array.isArray(test.data)||
            typeof test.createDate !== "string" ||
            typeof test.lastModificationDate !== "string") {            
            
            return null;
        }

        test.createDate = new Date(test.createDate);
        test.lastModificationDate = new Date(test.lastModificationDate);

        var nb_c = test.columns.length;
        for (var i = 0; i < test.data.length; i++) {
            if (test.data[i].length != nb_c) {
                throw new Error("Data length isn't the same as columns");
            }
        }

        var columns = [];
        var c;
        for (var i = 0; i < test.columns.length; i++) {
            c = Column.import(test.columns[i]);
            if (c)
                columns.push(c);
            else return null;
        }
        test.columns = columns;

        for (var i = 0; i < test.data.length; i++) {
            for (var j = 0; j < test.columns.length; j++) {
                if (!test.columns[j].verifyData(test.data[i][j]))
                    return null;
            } 
        }
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
        return this.data.length > 1 && this.isPlayableColumns();
    }

    isPlayableColumns() {
        if (this.columns.length > 1) {
            var set_ask = false;
            var set_show = false;
            var c;
            for (var i = 0; i < this.columns.length; i++) {
                c = this.columns[i];
                if (c.getSettings(Column.SET_CAN_BE_SHOW)) set_show = true;
                if (c.getSettings(Column.SET_CAN_BE_ASK)) set_ask = true;
                if (set_ask && set_show) return true;
            }
        }
        return false;
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

    /* get string */
    toString() {
        var id = this.id;
        delete this.id;
        var str = JSON.stringify(this);
        this.id = id;
        return str;
    }

    /* get the test as csv file */
    getCsv(columnName, columnType) {
        var csv = "";
        if (columnName) {
            for (var i = 0; i < this.columns.length; i++) {
                if (i > 0) csv += FILE_MANAGER.CSV_SEPARATOR;
                csv += FILE_MANAGER.toCsvCell(this.columns[i].name);
            }
            csv += FILE_MANAGER.CSV_LINE_SEPARATOR;
        }

        if (columnType) {
            for (var i = 0; i < this.columns.length; i++) {
                if (i > 0) csv += FILE_MANAGER.CSV_SEPARATOR;
                csv += FILE_MANAGER.toCsvCell(this.columns[i].getType());
            }
            csv += FILE_MANAGER.CSV_LINE_SEPARATOR;
        }

        for (var i = 0; i < this.data.length; i++) {
            for (var j = 0; j < this.columns.length; j++) {
                if (j > 0) csv += FILE_MANAGER.CSV_SEPARATOR;
                csv += FILE_MANAGER.toCsvCell(this.columns[j].getCsvValue(this.data[i][j]));
            }
            csv += FILE_MANAGER.CSV_LINE_SEPARATOR;
        }
        return csv;
    }

    getFilename() {
        return this.title
            .replaceAll(' ', '_')
            .replaceAll('.', '_')
            .replaceAll('/', '_')
            .replaceAll('\\', '_') + '.dkl';
    }
}
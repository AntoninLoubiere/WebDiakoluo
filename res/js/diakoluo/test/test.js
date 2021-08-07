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
        if (Array.isArray(test)) {
            var tests = [];
            for (var i = 0; i < test.length; i++) {
                tests.push(Test.import(test[i]));
            }
            return tests;
        }
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
        if (test.sync) delete test.sync;

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

    /* import from a csv file */
    static importCsv(csv, columnName, columnType) {
        var columns = [];
        var data = [];
        if (columnName) {
            var columnsName = FILE_MANAGER.readLine(csv);
        }

        if (columnType) {
            var columnType = FILE_MANAGER.readLine(csv);
        }

        var line = FILE_MANAGER.readLine(csv);
        for (var i = 0; i < line.length; i++) {
            columns.push(new (Column.getColumnClassCsv(columnType?.[i]))
                (columnName ? columnsName[i] : (I18N.getTranslation('default-column-title') + ' ' + (i + 1))))
        }

        var row;
        do {
            row = [];
            for (var i = 0; i < columns.length; i++) {
                row.push(columns[i].getDataFromCsv(line[i]));
            }
            data.push(row);
        } while ((line = FILE_MANAGER.readLine(csv)).length > 0);

        if (columns.length > 0) {
            var t = new Test(csv.file.name.replace(/\.[^/.]*$/, ''));
            if (csv.file.lastModified) t.createDate = t.lastModificationDate = new Date(csv.file.lastModified);
            t.columns = columns;
            t.data = data;
            return t;
        } else {
            return null;
        }
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
        return {
            title: this.title,
            description: this.description,
            playable: this.isPlayable(),
            id: this.id,
            sync: this.sync,
            lastUsed: this.lastUsed
        };
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

    registerLastUsed() {
        this.lastUsed = Date.now();
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
        var sync = this.sync;
        var syncData = this.syncData;
        delete this.id;
        delete this.sync;
        delete this.syncData;
        var str = JSON.stringify(this);
        this.id = id;
        this.sync = sync;
        this.syncData = syncData;
        return str;
    }

    /**
     * Get a test safe to transfer (without id and sync)
     */
    getSafeTest() {
        var t = Object.assign({}, this);
        delete t.id;
        delete t.sync;
        delete t.syncData;
        return t;
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
                csv += FILE_MANAGER.toCsvCell(this.columns[i].constructor.TYPE);
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
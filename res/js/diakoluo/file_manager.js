class FILE_MANAGER {

    static CSV_SEPARATOR = ',';
    static CSV_LINE_SEPARATOR = '\n';

    /* export the test (download the file) */
    static exportTest(test) {
        const a = document.createElement('a');  
        const t = FILE_MANAGER.getTestBlob(test);

        a.href= URL.createObjectURL(t);
        a.download = test.getFilename();
        a.click();

        URL.revokeObjectURL(t);
    }

    /* export the test in the csv format*/
    static exportCsvTest(test, columnName, columnType) {
        const a = document.createElement('a');  
        const t = FILE_MANAGER.getTestBlobCsv(test, columnName, columnType);

        a.href= URL.createObjectURL(t);
        a.download = test.getFilename();
        a.click();

        URL.revokeObjectURL(t);
    }

    static importTest(file, success) {
        var f = new FileReader();
        f.onload = function(event) {
            try {
                var t = Test.import(JSON.parse(f.result));
                if (t) {
                    DATABASE_MANAGER.addNewTest(t);
                    success?.();
                }
            } catch (e) {
                console.warn("Error while importing test", e);
            }
            
        }
        f.readAsText(file);
    }

    /* return the blob of the test */
    static getTestBlob(test) {
        return new Blob([test.toString()], {type: 'application/diakoluo'});
    }

    /* return the blob of the test in csv */
    static getTestBlobCsv(test, columnName, columnType) {
        return new Blob([test.getCsv(columnName, columnType)], {type: 'text/csv'});
    }

    /* return the cell of the string (escape chars) */
    static toCsvCell(string) {
        var quote = string.indexOf(' ') >= 0 ||
                    string.indexOf(',') >= 0 ||
                    string.indexOf('\n') >= 0 ||
                    string.indexOf('\r') >= 0 ||
                    string.indexOf('\"') >= 0 ||
                    string.indexOf('\'') >= 0 ||
                    string.length <= 0;

        string = string.replaceAll('\\', '\\\\').replaceAll('"', '\\"');
        if (quote) {
            return '"' + string + '"';
        } else {
            return string;
        }
    }
}
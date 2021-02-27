class FILE_MANAGER {

    static CSV_SEPARATOR = ',';
    static CSV_LINE_SEPARATOR = '\n';

    /* export the test (download the file) */
    static exportTest(test) {
        const t = FILE_MANAGER.getTestBlob(test);
        const a = document.createElement('a');  

        a.href= URL.createObjectURL(t);
        a.download = test.getFilename();
        a.click();

        URL.revokeObjectURL(t);
    }

    /* export the test in the csv format*/
    static exportCsvTest(test, columnName, columnType) {
        const t = FILE_MANAGER.getTestBlobCsv(test, columnName, columnType);
        const a = document.createElement('a');  

        a.href= URL.createObjectURL(t);
        a.download = test.getFilename();
        a.click();

        URL.revokeObjectURL(t);
    }

    /* export all tests */
    static exportAllTest() {
        FILE_MANAGER.getAllTestBlobCsv()
            .then((t) => {
                const a = document.createElement('a');  

                a.href= URL.createObjectURL(t);
                a.download = getTranslation('export-all-filename');
                a.click();

                URL.revokeObjectURL(t);
            })
            .catch((e) => {console.warn("Error", e);/* TODO */})
    }

    /* import a test */
    static importTest(file, formatDkl, csvColumnName, csvColumnType) {
        return new Promise(
            (resolve, reject) => {
                var f = new FileReader();
                f.onload = function(event) {
                    
                    try {
                        var t = formatDkl ? Test.import(JSON.parse(f.result)) : 
                                            Test.importCsv(new CsvContext(file, f.result), csvColumnName, csvColumnType);
                        if (Array.isArray(t)) {
                            for (var i = 0; i < t.length; i++) {
                                DATABASE_MANAGER.addNewTest(t[i]);
                            }
                            resolve();
                        } else if (t) {
                            DATABASE_MANAGER.addNewTest(t);
                            resolve();
                        } else {
                            reject();
                        }
                    } catch (e) {
                        console.warn("Error while importing test", e);
                        reject();
                    }
                    
                }
                f.onerror = () => reject();
                f.readAsText(file);
            }
        );
    }

    /* get the type of file, return true for dkl and false for csv */
    static getTypeFile(file) {
        return new Promise((resolve, reject) => {
            if (file.name.endsWith('.dkl')) {
                resolve(true);
            } else if (file.name.endsWith('.csv')) {
                resolve(false);
            } else {
                var f = new FileReader();
                f.onload = () => {
                    resolve((startsWithIgnoreSpace(f.result, '{') ||
                             startsWithIgnoreSpace(f.result, '[')) &&
                            (endsWithIgnoreSpace(f.result, '}') ||
                             endsWithIgnoreSpace(f.result, ']')));
                }
                f.onerror = reject;
            }
        });
    }

    /* return the blob of the test */
    static getTestBlob(test) {
        return new Blob([test.toString()], {type: 'application/diakoluo'});
    }

    /* return the blob of the test in csv */
    static getTestBlobCsv(test, columnName, columnType) {
        return new Blob([test.getCsv(columnName, columnType)], {type: 'text/csv'});
    }

    /* return the blob of all test in csv */
    static getAllTestBlobCsv(test) {
        return new Promise((resolve, reject) => {
            var data = [];
            DATABASE_MANAGER.forEach((test) => {
                if (test)
                    data.push(test.toString());
                else {
                    if (data) {
                        resolve(new Blob(['[' + data.join(',') + ']'], {type: 'application/diakoluo'}));
                    } else {
                        reject();
                    }
                }
            });
        });
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

    static readLine(context) {
        var list = [];
        var currentValue = "";

        var c;
        var previousC = ' ';

        var valueStarted = false;
        var quoted = false;
        var hasBeenQuoted = false;


        for (var i = context.i; i < context.content.length; i++) {
            c = context.content[i];
            if (quoted) {
                if (previousC == '"') {
                    if (c == '"') {
                        currentValue += '"';
                        previousC = ' ';
                    } else if (c == FILE_MANAGER.CSV_SEPARATOR) {
                        list.push(currentValue);
                        currentValue = "";
                        valueStarted = false;
                        previousC = ' ';
                        quoted = false;
                    } else if (c == FILE_MANAGER.CSV_LINE_SEPARATOR) {
                        break;
                    } else {
                        // not often because need "test" ,
                        hasBeenQuoted = true;
                        quoted = false;
                        previousC = ' ';
                        currentValue += c;
                    }
                } else if (c == '"') {
                    previousC = c;
                } else {
                    currentValue += c;
                }
            } else {
                if (valueStarted) {
                    if (c == FILE_MANAGER.CSV_SEPARATOR) {
                        if (hasBeenQuoted) {
                            list.push(currentValue);
                            hasBeenQuoted = false;
                        } else {
                            list.push(currentValue.replace(/(^ +)|( +$)/g, ''));
                        }
                        currentValue = "";
                        valueStarted = false;
                    } else if (c == FILE_MANAGER.CSV_LINE_SEPARATOR) {
                        break;
                    } else {
                        currentValue += c;
                    }
                } else {
                    if (c == '"') {
                        quoted = true;
                        valueStarted = true;
                    } else if (c == FILE_MANAGER.CSV_SEPARATOR) {
                        list.push("");
                    } else if (c == FILE_MANAGER.CSV_LINE_SEPARATOR && list.length > 0) {
                        break;
                    } else if (c != ' ' && c != '\t') {
                        valueStarted = true;
                        currentValue += c;
                    }
                }
            }
        }

        if (valueStarted) {
            if (hasBeenQuoted) {
                list.push(currentValue);
            } else {
                list.push(currentValue.replace(/(^ +)|( +$)/g, ''));
            }
        }

        context.i = i + 1; // remove the end line
        if (context.columns >= 0) {
            if (list.length < context.columns && list.length > 0) {
                throw new Error("Not enough columns");
            }
        } else {
            context.columns = list.length;
        }
        return list;
    }
}

class CsvContext {
    constructor(file, content) {
        this.file = file;
        this.content = content;
        this.i = 0;
        this.columns = -1;
    }
}
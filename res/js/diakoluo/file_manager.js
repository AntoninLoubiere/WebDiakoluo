class FILE_MANAGER {
    /* export the test (download the file) */
    static exportTest(test) {
        const a = document.createElement('a');  
        const t = FILE_MANAGER.getTestBlob(test);

        a.href= URL.createObjectURL(t);
        a.download = test.getFilename();
        a.click();

        URL.revokeObjectURL(t);
    }

    static importTest(file, success) {
        var f = new FileReader();
        f.onload = function(event) {
            try {
                console.log(event);
                var t = Test.import(JSON.parse(f.result));
                if (t) {
                    console.log(t);
                    DATABASE_MANAGER.addNewTest(t);
                    success?.();
                }
            } catch (e) {
                console.warn("Error while importing test", e);
            }
            
        }
        f.readAsText(file);
    }

    /* return the blob of a file */
    static getTestBlob(test) {
        return new Blob([test.toString()], {type: 'application/diakoluo'});
    }
}
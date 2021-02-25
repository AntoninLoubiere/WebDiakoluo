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

    /* return the blob of a file */
    static getTestBlob(test) {
        return new Blob([test.toString()], {type: 'application/diakoluo'});
    }
}
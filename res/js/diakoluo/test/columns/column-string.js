class ColumnString extends Column {

    static SET_CASE_SENSITIVE = 256; // 1 << 8
    static SET_TRIM_SPACES = 512; // 1 << 9
    static SET_LONG = 1024; // 1 << 10

    static TYPE = "String";

    constructor(name, description="") {
        super(ColumnString.TYPE, name, description);
        if (name) {
            this.settings |= SET_TRIM_SPACES;
        }
    }

    /* get the default value of data for the column */
    getDefaultValue() {
        return {value: ""};
    }

    /* get if a value is right */
    isRight(data, value) {
        if (this.getSettings(ColumnString.SET_TRIM_SPACES)) {
            var dv = data.value.trim(); 
            var v = value.value.trim(); 
        } else {
            var dv = data.value; 
            var v = value.value;
        }
        
        if (this.getSettings(ColumnString.SET_CASE_SENSITIVE)) {
            return dv === v;
        } else {
            return dv.toLowerCase() === v.toLowerCase();
        }
    }

    /* get the settings view of the column */
    getViewColumnSettings() {
        var div = super.getViewColumnSettings();
        div.appendChild(document.createElement('hr'));

        div.appendChild(
            VIEW_UTILS.booleanView(
                this.getSettings(ColumnString.SET_CASE_SENSITIVE), 
                getTranslation('column-string-case-sensitive')
            )
        );
        div.appendChild(
            VIEW_UTILS.booleanView(
                this.getSettings(ColumnString.SET_TRIM_SPACES), 
                getTranslation('column-string-trim-spaces')
            )
        );
        div.appendChild(
            VIEW_UTILS.booleanView(
                this.getSettings(ColumnString.SET_LONG), 
                getTranslation('column-string-long')
            )
        );

        return div;
    }

    /* get the settings view of the column */
    getEditColumnSettings() {
        var div = super.getEditColumnSettings();
        div.appendChild(document.createElement('hr'));

        div.appendChild(VIEW_UTILS.booleanEdit(
            this.getSettings(ColumnString.SET_CASE_SENSITIVE), 
            getTranslation('column-string-case-sensitive'),
            'column-case-sensitive'
        ));

        div.appendChild(VIEW_UTILS.booleanEdit(
            this.getSettings(ColumnString.SET_TRIM_SPACES), 
            getTranslation('column-string-trim-spaces'),
            'column-trim-spaces'
        ));

        div.appendChild(VIEW_UTILS.booleanEdit(
            this.getSettings(ColumnString.SET_LONG), 
            getTranslation('column-string-long'),
            'column-long'
        ));
        return div;
    }

    /* set the settings from the view */
    setEditColumnSettings(view) {
        super.setEditColumnSettings(view);
        this.setSettings(ColumnString.SET_CASE_SENSITIVE, view.querySelector('#column-case-sensitive').checked);
        this.setSettings(ColumnString.SET_TRIM_SPACES, view.querySelector('#column-trim-spaces').checked);
        this.setSettings(ColumnString.SET_LONG, view.querySelector('#column-long').checked);
    }
}
columnsClass.push(ColumnString);
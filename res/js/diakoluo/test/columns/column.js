var columnsClass = [];

class Column {
    static SET_CAN_BE_SHOW = 1; // 1 << 0
    static SET_CAN_BE_ASK = 2; // 1 << 1
    static DEFAULT_SETTINGS = Column.SET_CAN_BE_SHOW | Column.SET_CAN_BE_ASK;

    /* cast a column */
    static cast(column) {
        var columnClass;
        for (var i = 0; i < columnsClass.length; i++) {
            if (column.type == columnsClass[i].name) {
                columnClass = columnsClass[i];
                break;
            }
        }
        if (columnClass) {
            return Object.assign(new columnClass(), column);
        } else {
            throw new Error("Unknown type of column !");
        }
    }

    static getSkippedView() {
        var e = document.createElement('span');
        e.textContent = getTranslation('skipped');
        e.classList = ['skipped-answer'];
        return e;
    }

    /* create a column if second field is null, 0 fieds will be instentiate. Type represent the class name id */
    constructor(type, name, description = "") {
        this.type = type;
        if (name != null) {
            this.name = name;
            this.description = description;
            this.settings = Column.DEFAULT_SETTINGS;
        }
    }

    /* Get a string that represent the data */
    getDataValueString(data) {
        return data.value;
    }

    /* get a dom element that show the data */
    getViewView(data) {
        var e = document.createElement('span');
        if (data.value)
            e.textContent = data.value;
        else {
            e.textContent = getTranslation('empty-string');
            e.style.fontStyle = "italic";
        }
        return e;
    }

    /* get the view that can edit the data */
    getEditView(data) {
        var i = document.createElement('input');
        i.type = 'text';
        i.value = data.value;
        return i;
    }

    /* get the view to prompt when tested, like edit but without the data */
    getTestView(data) {
        var i = document.createElement('input');
        i.type = 'text';
        return i;
    }

    /* set the score and show the answer of the view and apply score */
    updateAnswerTestView(data, view, score) {
        var value = this.getValueFromView(view);
        if (this.isRight(data, value)) {
            score?.pushScore(1, 1);

            var e = this.getViewView(value);
            e.classList.add('right-answer');
            return e;
        } else if (this.isSkipped(data, value)) {
            score?.pushScore(0, 1);

            var div = document.createElement('div');
            div.appendChild(Column.getSkippedView());
            var e = this.getViewView(data);
            e.classList.add('answer-answer');
            div.appendChild(e);

            return div;
        }  else {
            score?.pushScore(0, 1);

            var div = document.createElement('div');
            var e = this.getViewView(value);
            e.classList.add('wrong-answer');
            div.appendChild(e);

            e = this.getViewView(data);
            e.classList.add('answer-answer');
            div.appendChild(e);
            return div;
        }
    }

    /* get the value stored in the view */
    getValueFromView(view) {
        return {value: view.value};
    }

    /* set the value from the value stored in the view */
    setValueFromView(data, view) {
        data.value = view.value;
    }

    /* get if a value is right */
    isRight(data, value) {
        return data.value === value.value;
    }

    /* get if a value is skipped */
    isSkipped(data, value) {
        return value.value === "";
    }

    /* get the default value of data for the column */
    getDefaultValue() {
        console.error("Not overrided");
    }

    /* get the settings view of the column */
    getViewColumnSettings() {
        var div = document.createElement('div');
        div.classList = ['unique-column'];
        
        div.appendChild(
            booleanView(
                this.getSettings(Column.SET_CAN_BE_SHOW), 
                getTranslation('column-can-show')
            )
        );
        div.appendChild(
            booleanView(
                this.getSettings(Column.SET_CAN_BE_ASK), 
                getTranslation('column-can-asked')
            )
        );
        return div;
    }

    /* get some parameters in settings */
    getSettings(params) {
        return this.settings & params === params;
    }

    /* set some parameters in settings */
    setSettings(params, value) {
        this.settings = value ? this.settings | params : this.settings & ~params;
    }
}   
var columnsClass = [];

class Column {
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

    /* create a column if second field is null, 0 fieds will be instentiate. Type represent the class name id */
    constructor(type, name, description = "") {
        this.type = type;
        if (name != null) {
            this.name = name;
            this.description = description;
        }
    }

    /* Get a string that represent the data */
    getDataValueString(data) {
        return data.value;
    }

    /* get the view that can edit the data */
    getEditView(data) {
        var i = document.createElement('input');
        i.type = 'text';
        i.value = data.value;
        return i;
    }

    /* set the value from the value stored in the view */
    setValueFromView(data, view) {
        data.value = view.value;
    }

    /* get the default value of data for the column */
    getDefaultValue() {
        console.error("Not overrided");
    }
}   
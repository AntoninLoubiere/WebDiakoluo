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

    getDataValueString(data) {
        return data.value;
    }
}   
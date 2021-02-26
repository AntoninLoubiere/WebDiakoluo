class ColumnString extends Column {
    constructor(name, description="") {
        super(ColumnString.name, name, description);
    }

    getDefaultValue() {
        return {value: ""};
    }

    getType() {
        return "String";
    }
}
columnsClass.push(ColumnString);
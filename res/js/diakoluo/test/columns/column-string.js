class ColumnString extends Column {

    static TYPE = "String";

    constructor(name, description="") {
        super(ColumnString.TYPE, name, description);
    }

    getDefaultValue() {
        return {value: ""};
    }
}
columnsClass.push(ColumnString);
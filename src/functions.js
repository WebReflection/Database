    
    function arrayfy(whatever) {
        return concat.call([], whatever === undefined ? [] : whatever);
    }
    
    function empty() {}
    
    function eventItem(i) {
        return this.result.rows.item(i);
    }
    
    function toListOfParameters(values) {
        return !isArray(values) || typeof values[0] != "object" || !values[0] ? [values] : values;
    }
    
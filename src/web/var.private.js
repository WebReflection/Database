    
        read = createReadOrQuery("readT"),
        query = createReadOrQuery("t"),
        document = window.document,
        openDatabase = window.openDatabase,
        expando = "_" + ("" + Math.random()).slice(2),
        isArray = Array.isArray || function (toString, a) {
            a = toString.call([]);
            return function isArray(o) {
                return a == toString.call(o);
            };
        }({}.toString),
        Object = window.Object,
        defineProperty = Object.defineProperty || function (o, k, d) {
            o[k] = d.value;
            return o;
        },
        DatabasePrototype = Database.prototype
    
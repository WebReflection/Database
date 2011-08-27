/*!
(C) Andrea Giammarchi, @WebReflection - Mit Style License
*/
/**@license (C) Andrea Giammarchi, @WebReflection - Mit Style License
*/var Database = (function (window) {"use strict";
    
    /* node.js not supported yet
    if (!{"function":1,"undefined":1}[typeof global]) {
        window.Database = Database;
        window = global;
    }
    */
    
    var
        undefined,
        SIZE = 5 * 1024 * 1024,
        TABLE = " TABLE ",
        DROP = "DROP",
        EXISTS = " EXISTS ",
        IF = "IF",
        concat = [].concat,
        read = createReadOrQuery("readT"),
        query = createReadOrQuery("t"),
        document = window.document,
        SQLTransaction = window.SQLTransaction,
        openDatabase = "openDatabase",
        expando = "_" + ("" + Math.random()).slice(2),
        autoIncrement = "id INTEGER PRIMARY KEY AUTOINCREMENT",
        Array = window.Array,
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
    ;
    
    function Database(options, fn) {
        
        var self = this instanceof Database ?
            this :
            new Database(options)
        ;
        
        if (isFunction(options)) {
            fn = options;
            options = {}
        } else if (!options) {
            options = {}
        }
        
        // internal db invisible outside the closure
        defineProperty(self, expando, {
            enumerable: !1,
            writable: !0,
            configurable: !0,
            value: window[openDatabase](
                self.name = options.name || document.domain || "db",
                self.version = options.version || "1.0",
                self.description = options.description || "data",
                self.size = options.size || SIZE,
                empty
            )
        });
        
        // but internal db can reach self inside the closure
        self[expando][expando] = self;
        
        return self;
    }
    
    DatabasePrototype.close = close;
    DatabasePrototype.create = create;
    DatabasePrototype.drop = drop;
    DatabasePrototype.insert = insert;
    DatabasePrototype.read = read;
    DatabasePrototype.query = query;
    DatabasePrototype.truncate = truncate;
    
    function arrayfy(whatever) {
        return concat.call([], whatever === undefined ? [] : whatever);
    }
    
    function close() {
        // this[expando][expando] = null;
        delete this[expando];
    }
    
    function create(name, fields, fn) {
        fields[0] || (fields[0] = autoIncrement);
        this.query("CREATE" + TABLE + IF + " NOT" + EXISTS + name + " (" + fields.join(", ") + ")", fn);
        return this;
    }
    
    function createReadOrQuery(method) {
        method += "ransaction";
        return function readOrWrite(SQL, A, fn) {
            var self = this;
            if (isFunction(A)) {
                fn = A;
                A = [];
            }
            self[expando][method](function (t) {
                for (var
                    sql = arrayfy(SQL),
                    a = arrayfy(A),
                    i = 0,
                    length = sql.length,
                    tr = (t[expando] = {self:self, fn:fn, i:length}),
                    tmp;
                    i < length; ++i
                ) {
                    t.executeSql(sql[i], arrayfy(a[i]), success, error);
                }
            });
            return self;
        };
    }
    
    function drop(name, fn) {
        this.query(DROP + TABLE + IF + EXISTS + name, fn);
        return this;
    }
    
    function empty() {}
    
    function error(t, result) {
        if (t = t[expando]) {
            --t.i || (t.fn || empty)({
                type: "error",
                error: result,
                db: t.self
            });
        }
    }
    
    function insert(name, values, fn) {
        for (var
            self = this,
            sql = [],
            a = !isArray(values) || typeof values[0] != "object" || !values[0] ? [values] : values,
            i = 0, length = a.length,
            many = Array(a[0].length + 1).join(", ?").slice(2);
            i < length; ++i
        ) {
            sql[i] = 'INSERT INTO ' + name + ' VALUES (' + many + ')';
        }
        self.query(sql, a, fn);
        return self;
    }
    
    function isFunction(fn) {
        return typeof fn == "function";
    }
    
    function item(i) {
        return this.result.rows.item(i);
    }
    
    function success(t, result) {
        if (t = t[expando]) {
            --t.i || (t.fn || empty)({
                type: "success",
                result: result,
                item: item,
                length: result.rows.length,
                db: t.self
            });
        }
    }
    
    function truncate(name, fn) {
        var
            self = this,
            rows, item
        ;
        self.read('SELECT * FROM sqlite_master WHERE name = ?', arrayfy(name), function (e) {
            if (e.type == "success") {
                item = e.result.rows.item(0);
                if (item && item.type == "table" && (item.tbl_name || item.name) == name) {
                    return self.query([
                        DROP + TABLE + name,
                        item.sql
                    ], fn);
                }
                e.type = "error";
                e.error = e.result;
                delete e.result;
            }
            fn(e);
        });
    }
    
    return Database;
    
}(this));
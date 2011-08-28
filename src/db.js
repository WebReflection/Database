var Database = (function (window) {"use strict";
    
    /**
     * Copyright (C) 2011 by Andrea Giammarchi, @WebReflection
     * 
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     * 
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     * 
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    
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
        max = window.Math.max,
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
    
    function Database(options) {
        
        if (!(this instanceof Database))
            return new Database(options)
        ;
        
        var self = this;
        
        options || (options = {});
        
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
    
    function arrayfy(whatever) {
        return concat.call([], whatever === undefined ? [] : whatever);
    }
    
    function close() {
        // hoping that Browsers will call asyncClose on their side
        // cannot actually remove references or transactions may fail
        // this[expando][expando] = null;
        // delete this[expando];
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
                    a = toListOfParameters(A),
                    i = 0,
                    length = max(sql.length, a.length),
                    tr = (t[expando] = {self:self, fn:fn, i:length}),
                    tmp;
                    i < length; ++i
                ) {
                    t.executeSql(sql[i] || sql[0], a[i], success, error);
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
            a = toListOfParameters(values),
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
    
    function toListOfParameters(values) {
        return !isArray(values) || typeof values[0] != "object" || !values[0] ? [values] : values;
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
    
    DatabasePrototype.close = close;
    DatabasePrototype.create = create;
    DatabasePrototype.drop = drop;
    DatabasePrototype.insert = insert;
    DatabasePrototype.read = read;
    DatabasePrototype.query = query;
    DatabasePrototype.truncate = truncate;
    
    return Database;
    
}(this));
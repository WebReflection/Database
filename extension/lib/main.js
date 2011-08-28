const {Cc, Ci} = require("chrome");

var Database = function () {
    
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
    
    var
        undefined,
        SIZE = 5 * 1024 * 1024,
        TABLE = " TABLE ",
        DROP = "DROP",
        EXISTS = " EXISTS ",
        IF = "IF",
        autoIncrement = "id INTEGER PRIMARY KEY AUTOINCREMENT",
        max = Math.max,
        concat = [].concat,
        isArray = Array.isArray
    ;
    
    function arrayfy(whatever) {
        return concat.call([], whatever === undefined ? [] : whatever);
    }
    
    function openDatabase(name) {
        var
            file = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties).get("UChrm", Ci.nsIFile),
            store = Cc["@mozilla.org/storage/service;1"].getService(Ci.mozIStorageService)
        ;
        file.append("localhost"); // find a way to retrieve the current domain here
        if (!file.exists() || !file.isDirectory()) {
            file.create(Ci.nsIFile.DIRECTORY_TYPE, 0777);
        }
        file.append(("" + name).replace(/\W/g, "_") + ".sqlite");
        if (!file.exists()) {
            file.create(Ci.nsIFile.FILE_TYPE, 0777);
        }
        return store.openDatabase(file);
    }
    
    function toListOfParameters(values) {
        return !isArray(values) || typeof values[0] != "object" || !values[0] ? [values] : values;
    }
    
    function item(i) {
        return this[i];
    }
    
    function eventItem(i) {
        return this.result.rows.item(i);
    }
    
    function success(result) {
        if (--this.i) return;
        var
            statement = this.statement,
            columns = [],
            rows = [],
            i, length, row, tmp
        ;
        for (i = 0, length = statement.columnCount; i < length; ++i) {
            columns[i] = statement.getColumnName(i);
        }
        while (row = result.getNextRow()) {
            rows.push(tmp = {});
            for (i = 0, length = row.numEntries; i < length; ++i) {
                tmp[columns[i]] = row.getResultByIndex(i);
            }
        }
        rows.item = item;
        this.successful = true;
        (this.fn || empty)({
            type: "success",
            result: {
                insertId: this.db.lastInsertRowID,
                rowsAffected: 0,
                rows: rows
            },
            item: eventItem,
            length: rows.length,
            db: this.self
        });
    }
    
    function error(e) {
        --this.i || (this.fn || empty)({
            type: "error",
            error: e,
            db: this.self
        });
    }
    
    function complete(reason) {
        this.successful || --this.i || (this.fn || empty)({
            type: "success",
            result: {
                insertId: this.db.lastInsertRowID,
                rowsAffected: 0, // TODO: is there a way to know this?
                rows: []
            },
            item: eventItem,
            length: 0,
            db: this.self
        });
    }
    
    function empty() {}
    
    function Database(options) {
        
        if (!(this instanceof Database))
            return new Database(options)
        ;
        
        var self = this, db;
        
        options || (options = {});
        
        db = openDatabase(self.name = options.name || document.domain || "db");
        
        // fields assigned but ignored behind the scene in this version
        self.version = options.version || "1.0";
        self.description = options.description || "data";
        self.size = options.size || SIZE;
        
        self.close = function close() {
            db.asyncClose();
        };
        
        self.create = function create(name, fields, fn) {
            fields[0] || (fields[0] = autoIncrement);
            self.query("CREATE" + TABLE + IF + " NOT" + EXISTS + name + " (" + fields.join(", ") + ")", fn);
            return self;
        };
        
        self.drop = function drop(name, fn) {
            self.query(DROP + TABLE + IF + EXISTS + name, fn);
            return self;
        };
        
        self.insert = function insert(name, values, fn) {
            for (var
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
        };
        
        self.read = self.query = function query(SQL, A, fn) {
            if (typeof A == "function") {
                fn = A;
                A = [];
            }
            db.beginTransaction();
            for (var
                sql = arrayfy(SQL),
                a = toListOfParameters(A),
                i = 0,
                length = max(sql.length, a.length),
                tr = {
                    i: length,
                    self: self,
                    fn: fn,
                    db: db,
                    handleResult: success,
                    handleCompletion: complete,
                    handleError: error
                },
                statement;
                i < length; ++i
            ) {
                try {
                    statement = db.createStatement(sql[i] || sql[0]);
                    for (let param in statement.params) {
                        statement.params[param] = a[i][param];
                    }
                    tr.statement = statement;
                    statement.executeAsync(tr);
                } catch(e) {
                    tr.handleError(e);
                    break;
                }
                
            }
            db.commitTransaction();
        };
        
        self.truncate = function truncate(name, fn) {
            var rows, item;
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
        };
        
    }
    
    return Database;
    
}();

/*test

var db = new Database({name:"test"});
db.query("CREATE TABLE test (key TEXT, value INTEGER)", function () {
    console.log("createion OK");
});
db.query([
    "INSERT INTO test VALUES (?, ?)",
    "INSERT INTO test VALUES (?, ?)"
], [
    ["a", 1],
    ["b", 2]
], function () {
    console.log("insertion OK 1");
});

db.query("INSERT INTO test VALUES (:key, :value)", {key:"c", value:3}, function () {
    console.log("insertion OK 2");
});

db.read("SELECT * FROM test", function (result) {
    console.log(JSON.stringify(result));
});

db.truncate("test", function (e) {
    console.log("truncate: " + e.type);
    db.read("SELECT * FROM test", function (result) {
        console.log(JSON.stringify(result));
    });
});

db.create("contacts", [
    null,
    "name TEXT",
    "cell TEXT"
], function (e) {
    console.log("create: " + e.type);
    db.insert("contacts", [
        [null, "bang bang honey", "123"],
        [null, "schweetie schweetie", "456"]
    ], function (e) {
        console.log("insert: " + e.type);
        db.read("SELECT * FROM contacts", function (result) {
            for (var i = 0; i < result.length; ++i) {
                console.log(JSON.stringify(result.item(i)));
            }
        });
    });
});

//db.drop("test", function (e) {console.log("drop: " + e.type);});
//*/

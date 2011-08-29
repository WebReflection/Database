    
    
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
                    tr = null;
                    break;
                }
                
            }
            tr && db.commitTransaction();
            /*
            tr ?
                db.commitTransaction() :
                db.rollbackTransaction()
            ;
            */
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
    
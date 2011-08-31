    
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
            if (typeof A == "function") {
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
    
    function success(t, result) {
        if (t = t[expando]) {
            --t.i || (t.fn || empty)({
                type: "success",
                result: result,
                item: eventItem,
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
        self.query('SELECT * FROM sqlite_master WHERE name = ?', arrayfy(name), function (e) {
            if (e.type == "success") {
                item = e.length && e.result.rows.item(0);
                if (item && item.type == "table" && (item.tbl_name || item.name) == name) {
                    // safer to perform double transaction here
                    // due XUL native SQLite problems that actually "waried me" ...
                    return self.query(DROP + TABLE + name, function (e) {
                        self.query(item.sql, fn);
                    });
                }
                e.type = "error";
                e.error = {message: "table " + name + " does not exists"};
                delete e.result;
            }
            fn(e);
        });
        return self;
    }
    
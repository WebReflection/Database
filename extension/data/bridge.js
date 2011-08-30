
(function (port, domain, window, sbWindow) {
    
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
    
    function eventItem(i) {
        return this.result.rows.item(i);
    }
    
    function item(i) {
        return this[i];
    }
    
    function empty() {}
    
    var
        SIZE = 5 * 1024 * 1024,
        defineProperty = Object.defineProperty || function (o, k, v) {
            o[k] = v.value;
            return o;
        },
        uid = "_" + domain + "_" + ("" + Math.random()).slice(2) + "_" + (+ new Date) + "_",
        drop_uid = "_drop" + uid,
        create_uid = "_create" + uid,
        insert_uid = "_insert" + uid,
        query_uid = "_query" + uid,
        truncate_uid = "_truncate" + uid,
        uids = [drop_uid, create_uid, insert_uid, query_uid, truncate_uid],
        instance = [],
        DatabasePrototype
    ;
    
    DatabasePrototype = (window.Database = function Database(options) {
        
        if (!(this instanceof Database))
            return new Database(options)
        ;
        
        options || (options = {});
        
        defineProperty(this, uid, {
            configurable: false,
            writable: false,
            enumerable: false,
            value: instance.push(this) - 1
        });
        
        uids.forEach(function (uid) {
            defineProperty(this, uid, {
                configurable: false,
                writable: false,
                enumerable: false,
                value: []
            });
        }, this);
        
        port.emit("init", {
            domain: domain,
            options: options,
            i: this[uid]
        });
        
        this.name = options.name || "db";
        this.version = options.version || "1.0";
        this.description = options.description || "data";
        this.size = options.size || SIZE;
        
    }).prototype;
    
    DatabasePrototype.close = function close() {
        port.emit("dbclose", {
            i: this[uid]
        });
    };
    
    DatabasePrototype.create = function create(name, fields, fn) {
        port.emit("dbcreate", {
            uid: create_uid,
            id: this[create_uid].push(fn || empty) - 1,
            i: this[uid],
            result: [name, fields]
        });
        return this;
    };
    
    DatabasePrototype.drop = function drop(name, fn) {
        port.emit("dbdrop", {
            uid: drop_uid,
            id: this[drop_uid].push(fn || empty) - 1,
            i: this[uid],
            result: [name]
        });
        return this;
    };
    
    DatabasePrototype.insert = function insert(name, values, fn) {
        port.emit("dbinsert", {
            uid: insert_uid,
            id: this[insert_uid].push(fn || empty) - 1,
            i: this[uid],
            result: [name, values]
        });
        return this;
    };
    
    DatabasePrototype.read =
    DatabasePrototype.query = function query(SQL, A, fn) {
        var args = [SQL];
        if (typeof A == "function") {
            fn = A;
            A = [];
        } else {
            args.push(A);
        }
        port.emit("dbquery", {
            uid: query_uid,
            id: this[query_uid].push(fn || empty) - 1,
            i: this[uid],
            result: args
        });
        return this;
    };
    
    DatabasePrototype.truncate = function truncate(name, fn) {
        port.emit("dbtruncate", {
            uid: truncate_uid,
            id: this[truncate_uid].push(fn || empty) - 1,
            i: this[uid],
            result: [name]
        });
        return this;
    };
    
    port.on("result", function (info) {
        var
            self = instance[info.i],
            queue = self[info.uid],
            result = info.result
        ;
        result.db = self;
        if ("result" in result) {
            result.item = eventItem;
            result.result.rows.item = item;
        }
        queue[info.id](result);
        delete queue[info.id];
    });
    
    port.emit("pagestart", {
        domain: domain,
        uid: uid
    });
    
    sbWindow.addEventListener("unload", function () {
        instance.forEach(function (db) {
            db.close();
        });
    }, false);
    
}(
    self.port,
    document.domain || "localhost",
    window.wrappedJSObject,
    window
));

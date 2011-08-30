    
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
    
    function error(e) {
        --this.i || (this.fn || empty)({
            type: "error",
            error: e,
            db: this.self
        });
    }
    
    function item(i) {
        return this[i];
    }
    
    const {Cc, Ci} = require("chrome");
    
    function openDatabase(name, domain) {
        var
            file = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties).get("UChrm", Ci.nsIFile),
            store = Cc["@mozilla.org/storage/service;1"].getService(Ci.mozIStorageService)
        ;
        file.append(domain);
        if (!file.exists() || !file.isDirectory()) {
            file.create(Ci.nsIFile.DIRECTORY_TYPE, 0777);
        }
        file.append(name.replace(/\W/g, "_") + ".sqlite");
        if (!file.exists()) {
            file.create(Ci.nsIFile.FILE_TYPE, 0777);
        }
        return store.openDatabase(file);
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
    
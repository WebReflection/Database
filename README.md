Simplified Web SQL Database Management
======================================

db.js goal is to simplify common [Web SQL Database](http://www.w3.org/TR/webdatabase/) operations through an intuitive interface.

Main db.js features are:

  * **CPU and memory safe** thanks to an interface that does not require up to 3 callbacks per each asynchronous operations
  * **tiny** library with **no** external **dependencies**
  * simplified **CREATE TABLE** with primary id autoincrement shortcut
  * simplified **INSERT** operations, accepting one or more arrays or objects automatically
  * simplified **TRUNCATE TABLE** operation, by default not possible in SQLite
  * **unified callback** behavior via custom **Event object** so that one callback could be potentially used with every operation


API
===

following the list of methods and examples


constructor
-----------

Create a *db* instance following native JS behavior where *new* can or cannot be used.

    var db = new Database;
    /**
     * default options:
     *  name            "db"        the database name
     *  size            (int)5Mb    the initial size of the db
     *  description     "data"      the database description
     *  version         "1.0"       the db version
     */
    
    var db2 = new Database({
        name: "personal_data",
        description: "my business",
        size: 1 * 1024 * 1024 // 1Mb
    });


db.create(tableName, fields[, callback])
----------------------------------------

Create a *tableName* only if does not exist already. *fields* is an Array of field where if the first value is undefined or null an autoincrement **id** will be created automatically.

    // contacts table creation example
    db.create("contacts", [
        null,                   // id INTEGER PRIMARY KEY AUTOINCREMENT
        "name TEXT NOT NULL",   // the second field of this table
        "cell TEXT NOT NUll"    // the third field of this table
    ]);
    
    // table with no id
    db.create("events", [
        "date INTEGER",         // used to store 20110827 as example
        "description TEXT"      // used to store the event description
    ]);
    
    // use a callback to be sure about the operation
    db.create(name, fields, function (evt) {
        // if "success" either it was created
        // or it was already there
        if (evt.type === "success") {
            // keep working with this table
        } else if (evt.type === "error") {
            // inform the user it was not possible to create the table
        }
    });
    


db.insert(tableName, data[, callback])
----------------------------------------

Insert data into a table. 

    db.insert("contacts", [
        null,               // id, incremented by default
        "WebReflection",    // name
        "911"               // phone number ( for development emergencies! )
    ]);

*data* can be an Array or a collection of Arrays

    db.insert("contacts", [[
        null, "Mate", "01234"
    ], [
        null, "Dude", "56789"
    ]]);

`insert()`, as well as every other *db* method, can accept a callback as third argument. This will be invoked once when all operations have been completed.

Please **note** that databases are basically always **homogenous collections** of data.
If you have a list of *key/value* pairs, consider [JSONH](https://github.com/WebReflection/JSONH) as solution for its translation into a valid array for an `insert()`.

    // generic collection of data
    var myData = [{
        id: 1,
        name: "Mate",
        cell: "01234"
    }, {
        id: 2,
        name: "Dude",
        cell: "56789"
    }];
    
    // create packed version of the data (it's FAST!)
    var
        myDBData = JSONH.pack(myData),
        headers = myDBData[0]
    ;
    // remove JSONH headers info (number of headers plus first index)
    myDBData = myDBData.slice(headers + 1);
    
    // create an array of values per table row
    for (var dbData = [], i = 0; i < myDBData.length; i += headers) {
        dbData.push(myDBData.slice(i, i + headers));
    }
    
    // insert into db all of them
    db.insert("contacts", dbData);


db.drop(tableName[, callback])
------------------------------
Drop/remove a table only if exists.

    db.drop("contacts", function (e) {
        if (e.type === "success") {
            alert("... feeling lonely ...");
        }
    });


db.truncate(tableName[, callback])
----------------------------------

Truncate is not natively supported by SQLite syntax but this method is clever enough and super fast: it saves the *creation table* statement first, and if `db.drop(tableName)` operation was successful, it creates the table again as it was before.

    db.truncate("contacts", function (e) {
        if (e.type === "success") {
            alert("Ready for a new life!");
        }
    });


db.query(SQL, arguments[, callback])
------------------------------------

Every `db.query()` call creates a new *transaction* and this method is able to accept one or more SQL statements per transactions.

    // single UPDATE example
    db.query(
        'UPDATE TABLE contacts SET cell = ? WHERE name = ?',
        [
            "76543",    // the new cell to update
            "Mate"      // the contact name which cell has to be updated
        ]
    );
    
    // multiple UPDATE example. One query, many updates
    db.query(
        'UPDATE TABLE contacts SET cell = ? WHERE name = ?', [
        [
            "76543",    // the new cell to update
            "Mate"      // the contact name which cell has to be updated
        ], [
            "35468",    // the new cell to update
            "Dude"      // the contact name which cell has to be updated
        ]
    ]);
    
    // multiple query example. N queries, N updates
    db.query([
        'UPDATE TABLE contacts SET cell = ? WHERE name = ?',
        'UPDATE TABLE contacts SET name = ? WHERE cell = ?'
    ], [
        [
            "76543",    // the new cell to update
            "Mate"      // the contact name which cell has to be updated
        ], [
            "35468",    // the new cell to update
            "Dooooode"  // the contact name which cell has to be updated
        ]
    ]);

Everything is still valid if the *arguments* is an object, rather than an array.

    db.query(
        'UPDATE TABLE contacts SET cell = :cell WHERE name = :name',
        [
            cell: "76543",
            name: "Mate"
        ]
    );

With `db.query()` *arguments* could be an object, an array, or a collection of both.


db.read(SQL, arguments[, callback])
-----------------------------------

The `db.read()` method is similar to the `db.query()` one except it uses **readTransaction** rather than **transaction**.

The difference between these two native methods is that *transaction* operates in **read/write** mode while *readTransaction* operates in **read only** mode.

I could not measure performances but if a query is about reading, rather than inserting, deleting, or updating, `db.read()` is the method you are looking for, assuming things are optimized and faster on SQLite level.


Callback Event object
=====================

Every callback will always receive the same kind of *Event objetct*.
This object has these peculiarities:

    // if everything was fine ...
    {
        type: "success",
        result: SQLStatementCallback,
        item: function (i) { // shortcut
            return this.result.rows.item(i);
        },
        length: result.rows.length // as shortcut,
        db: reference // the database object that performed the query
    }
    
    // if something went terribly wrong ...
    {
        type: "error",
        error: SQLStatementErrorCallback,
        db: reference // the database object that performed the query
    }

In this way it is **always possible to recycle callbacks** rather than create a new function per each operation.
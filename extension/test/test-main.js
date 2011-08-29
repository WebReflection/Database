const main = require("main");

exports.test_test_run = function(test) {
var db = main.Database({name:"test"});
db.query("CREATE TABLE test (key TEXT, value INTEGER)", function () {
    test.pass("createion OK");
    test.done();
});
db.query([
    "INSERT INTO test VALUES (?, ?)",
    "INSERT INTO test VALUES (?, ?)"
], [
    ["a", 1],
    ["b", 2]
], function () {
    test.pass("insertion OK 1");
    test.done();
});

db.query("INSERT INTO test VALUES (:key, :value)", {key:"c", value:3}, function () {
    test.pass("insertion OK 2");
    test.done();
});

db.read("SELECT * FROM test", function (result) {
    test.pass(JSON.stringify(result));
    test.done();
});

db.truncate("test", function (e) {
    test.pass("truncate: " + e.type);
    db.read("SELECT * FROM test", function (result) {
        test.pass(JSON.stringify(result));
        test.done();
    });
    test.done();
});

db.create("contacts", [
    null,
    "name TEXT",
    "cell TEXT"
], function (e) {
    test.pass("create: " + e.type);
    db.insert("contacts", [
        [null, "bang bang honey", "123"],
        [null, "schweetie schweetie", "456"]
    ], function (e) {
        test.pass("insert: " + e.type);
        db.read("SELECT * FROM contacts", function (result) {
            for (var i = 0; i < result.length; ++i) {
                test.pass(JSON.stringify(result.item(i)));
            }
            test.done();
        });
        test.done();
    });
});

//db.drop("test", function (e) {console.log("drop: " + e.type);});
};

exports.test_id = function(test) {
  test.assert(require("self").id.length > 0);
};

exports.test_url = function(test) {
  require("request").Request({
    url: "http://www.mozilla.org/",
    onComplete: function(response) {
      test.assertEqual(response.statusText, "OK");
      test.done();
    }
  }).get();
  test.waitUntilDone(20000);
};

exports.test_open_tab = function(test) {
  const tabs = require("tabs");
  tabs.open({
    url: "http://www.mozilla.org/",
    onReady: function(tab) {
      test.assertEqual(tab.url, "http://www.mozilla.org/");
      test.done();
    }
  });
  test.waitUntilDone(20000);
};
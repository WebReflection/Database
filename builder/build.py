# JSBuilder http://code.google.com/p/javascript-builder/

copyright = '(C) Andrea Giammarchi, @WebReflection - Mit Style License'

import JSBuilder

# embedded DOM version for HTML tests
print ("")
print ("-----------------------")
print ("|  db.js DOM version  |")
print ("-----------------------")
JSBuilder.compile(
    copyright,
    'build/db.js',
    'build/db.min.js',
    [
        "intro.js",
        "web/Database.js",
        "web/functions.js",
        "functions.js",
        "var.intro.js",
        "web/var.private.js",
        "var.outro.js",
        "web/outro.js",
        "outro.js"
    ], [
        "/*{use_strict}*/"
    ], [
        '"use strict";'
    ]
)
print ("----------------------")
print ("")
print ("")
print ("-----------------------")
print ("|  db.js XUL version  |")
print ("-----------------------")

JSBuilder.compile(
    copyright,
    'extension/lib/db.js',
    '',
    [
        "intro.js",
        "xul/Database.js",
        "xul/functions.js",
        "functions.js",
        "var.intro.js",
        "xul/var.private.js",
        "var.outro.js",
        "outro.js"
    ], [
        "/*{use_strict}*/"
    ], [
        'exports.Database = Database;'
    ]
)
print ("----------------------")
print ("")

try:
    JSBuilder.write("../../Desktop/addon-sdk-1.0/websqldatabase/package.json", JSBuilder.read("../extension/package.json"))
    JSBuilder.write("../../Desktop/addon-sdk-1.0/websqldatabase/README.md", JSBuilder.read("../extension/README.md"))
    JSBuilder.write("../../Desktop/addon-sdk-1.0/websqldatabase/lib/db.js", JSBuilder.read("../extension/lib/db.js"))
    JSBuilder.write("../../Desktop/addon-sdk-1.0/websqldatabase/lib/main.js", JSBuilder.read("../extension/lib/main.js"))
    JSBuilder.write("../../Desktop/addon-sdk-1.0/websqldatabase/doc/main.md", JSBuilder.read("../extension/doc/main.md"))
    JSBuilder.write("../../Desktop/addon-sdk-1.0/websqldatabase/data/bridge.js", JSBuilder.read("../extension/data/bridge.js"))
    JSBuilder.write("../../Desktop/addon-sdk-1.0/websqldatabase/test/test-main.js", JSBuilder.read("../extension/test/test-main.js"))
except:
    print("SDK folder not found")

# let me read the result ...
import time
time.sleep(2)
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
try:
    JSBuilder.compile(
        copyright,
        'extension/lib/main.js',
        'extension/lib/db.js',
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
except:
    print ("----------------------")
    print("minifier not compatible with XUL specific syntax")

print ("")

# let me read the result ...
import time
time.sleep(2)
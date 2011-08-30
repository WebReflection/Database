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

# automate the xpi creation/build process
# change this address if necessary to point to proper sdk folder
relativeSDKPath = "../../Desktop/addon-sdk-1.0/bin/"
try:
    import os
    current = JSBuilder.fullPath("../")
    sdk = JSBuilder.fullPath(relativeSDKPath)
    os.chdir(sdk)
    os.system("./cfx xpi --pkgdir=" + current + "/extension")
    f = open("dbjs.xpi", "r")
    content = f.read()
    f.close()
    f = open(current + "/build/dbjs.xpi", "w")
    f.write(content)
    f.close()
    os.remove("dbjs.xpi")
except:
    print("SDK folder not found")

# let me read the result ...
import time
time.sleep(2)
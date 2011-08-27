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
        "db.js"
    ]
)
print ("----------------------")
print ("")

# let me read the result ...
import time
time.sleep(2)
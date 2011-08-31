
var
    Database = require("db").Database,
    instance = {}
;

require("page-mod").PageMod({
    
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
    
    include: ["*", "file://*", "resource://*", "about:*"],
    contentScriptWhen: "start",
    contentScriptFile: require("self").data.url("bridge.js"),
    onAttach: function (worker) {
        
        function commonEvent(method) {
            port.on("db" + method, function (info) {
                var self = instance[uid][info.i];
                info.result.push(function (result) {
                    info.result = result;
                    port.emit("result", info);
                });
                self[method].apply(self, info.result);
            });
        }
        
        var
            port = worker.port,
            domain, uid
        ;
        
        // global configuration
        port.on("pagestart", function (info) {
            domain = info.domain.replace(/\./g, "_");
            uid = info.uid;
            instance[uid] || (instance[uid] = []);
        });
        
        // constructor
        port.on("init", function (info) {
            (instance[uid][info.i] = new Database(
                info.options,
                info.domain
            ))[uid] = info.i;
        });
        
        // methods
        port.on("dbclose", function (info) {
            var self = instance[uid][info.i];
            if (self) {
                delete instance[uid][info.i];
                self.close();
            }
        });
        
        // common
        commonEvent("create");
        commonEvent("drop");
        commonEvent("insert");
        commonEvent("query");
        commonEvent("truncate");
    }
});

    
    function Database(options) {
        
        if (!(this instanceof Database))
            return new Database(options)
        ;
        
        var self = this;
        
        options || (options = {});
        
        // internal db invisible outside the closure
        defineProperty(self, expando, {
            enumerable: !1,
            writable: !0,
            configurable: !0,
            value: openDatabase(
                self.name = options.name || document.domain.replace(/\./g, "-") || "db",
                self.version = options.version || "1.0",
                self.description = options.description || "data",
                self.size = options.size || SIZE,
                empty
            )
        });
        
        // but internal db can reach self inside the closure
        self[expando][expando] = self;
        
        return self;
    }
    
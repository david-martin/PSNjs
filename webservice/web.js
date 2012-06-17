var psn = require("../psn.js");

// define methods here
var methods = {
    user:function(args, cb){
        if (!args[0]) return {error: "No user supplied"};
        psn.profile(args[0], cb);
    }
};

// start web service
var app = require('http').createServer(function (req, res){
    // parse the supplied URL
    var data = require('url').parse(req.url, true);
    
    // handle root URL
    if ( (data.pathname == "/") || (data.pathname === "") ){
        res.write("Example PSN API Service");
        res.end("");
        return;
    }
    
    // 404 the favicon
    if (data.pathname == "/favicon.ico"){
        res.writeHead(404);
        res.end("");
        return;
    }
    
    // handle methods
    var m = findMethod(data.pathname);
    
    if (!m){
        res.end("No such method");
    }else{
        var result = m.func(m.v, function(d){
            res.write(JSON.stringify(d));
            res.end();
        });
    }
    
    if (!result){
        return false;
    }else{
        res.write(JSON.stringify(result));
        return res.end();
    }
});

// start web server
app.listen(2265, function() {
    console.log("Server started");
});

function findMethod(path){
    var mclone = methods;
    var r;
    var found = false;
    // remove leading/trailing slashes
    path = path.replace(/^\/+|\/+$/g, '');
    // split part into pieces
    path = path.split("/");
    // loop through pieces and find method
    var a;
    while(path){
        // grab branch of methods tree
        var m = path.shift();
        
        // is this part of the methods tree?
        if ( mclone[m] ){
            // we're now at this node
            mclone = mclone[m];
            
            // are we a function?
            if ( (typeof(mclone) == "function") ){
                // yes?! let's use this branch!
                return {func: mclone, v: path};
            }
        }else{
            return false;
        }
    }
}
// Class to handle network connections etc.

// configuration (can change occasionally!)
var fw = "4.11";
exports.fw = fw;

var auths = {
    basic:  ["c7y-basic01", "A9QTbosh0W0D^{7467l-n_>2Y%JG^v>o"],
    trophy: ["c7y-trophy01", "jhlWmT0|:0!nC:b:#x/uihx'Y74b5Ycx"]
};

var endpoints = {
    us: 'http://searchjid.usa.np.community.playstation.net/basic_view/func/search_jid',
    jp: 'http://searchjid.jpn.np.community.playstation.net/basic_view/func/search_jid',
    gb: 'http://searchjid.eu.np.community.playstation.net/basic_view/func/search_jid'
};
exports.endpoints = endpoints;
var profilepoints = {
    us: 'http://getprof.us.np.community.playstation.net/basic_view/func/get_profile',
    gb: 'http://getprof.gb.np.community.playstation.net/basic_view/func/get_profile',
    jp: 'http://getprof.jp.np.community.playstation.net/basic_view/func/get_profile'
};
exports.profilepoints = profilepoints;

// lib
var xml2js = require("xml2js");
var parser = new xml2js.Parser({explicitRoot:true});
var digest = require("./digest.js");

var regions = [];
for(var region in endpoints){
    regions.push(region);
}
exports.regions = regions;

function fetch(url, data, auth, cb){
    // parse URL into segments
    var d = require('url').parse(url);
    
    // check for missing arguments
    if (!auth){
        cb = data;
        auth = null;
        data = null;
    }else if (!cb){
        cb = auth;
        auth = null;
    }
    
    if (!auth){
        // no auth?... do normal request! :D
        var request = require("http").request(((data)?'POST':'GET'), d.path, {
        'host': d.hostname,
        //'Referer': 'http://us.playstation.com/playstation/psn/profile/friends',
        'User-Agent': 'PS3Application libhttp/4.1.1-000 (CellOS)',
        'Accept': '*/*'});
        request.on('response', function(response) {
            response.setEncoding('utf8');
            var body = "";
            response.on('data', function(chunk) {
                body += chunk;
            });
            response.on('end', function() {
                cb(body.replace(/[\t\r\n]/g, ""));
            });
        });
        if (data) request.write(data);
        request.end();
    }else{
        // auth? use digest client
        var digestClient = digest.createClient(
            d.port,
            d.hostname,
            auths[auth][0],
            auths[auth][1]
        );
        var hdrs = {
            "accept":"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Content-Type":"text/xml; charset=UTF-8",
            "host":d.hostname,
            "User-Agent":"PS3Community-agent/1.0.0 libhttp/1.0.0"
        };
    
        makeReq(digestClient, hdrs, data, d, cb);
    }
}
exports.fetch = fetch;

function makeReq(digestClient, hdrs, data, d, cb, i){
    // check we have an iterator count
    if (typeof(i)=="undefined") i = 0;
    
    // only attempt connections twice
    if(i == 2) return;
    
    // make request
	var req = digestClient.request("POST", d.path, hdrs);
	req.addListener("response", function(response){
        
        // check data was successful
        if (response.statusCode < 300){
            
            // let's accept utf-8 :D
            response.setEncoding('utf8');
            
            // listener for data packets
            var body = "";
            response.addListener('data', function (chunk) {
                body += chunk;
            });
            
            // wait for end of data stream
            response.addListener('end', function () {
                // convert XML if present
                if (/^<\?xml/.test(body)){
                    parser.parseString(body, function(err, r){
                        body = r;
                        cb({headers: response.headers, body: body});
                    });
                }else{
                    // callback data
                    cb({headers: response.headers, body: body});
                }
            });
        }else{
            // failed. Try again!
            makeReq(digestClient, hdrs, data, d, cb, i + 1);
        }
	});
    req.write(data);
	req.end();
}
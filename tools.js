// lib
var http = require('http');

// http object for connectingt to us.playstation.com
var psn_http = http.createClient(80, 'us.playstation.com');

// clean up a given username, PSN (according to Wikipedia) only accepts alphanumberic, underscores and hyphens
function cleanupUsername(u){
    return u.replace(/[^a-zA-Z0-9_-]/g, "");
}
exports.cleanupUsername = cleanupUsername;

// standard fetch function
function fetch(path, cb){
    var request = psn_http.request('GET', path, {
        'host': 'us.playstation.com',
        'Referer': 'http://us.playstation.com/playstation/psn/profile/friends',
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
    request.end();
}
exports.fetch = fetch;

// helper function to fetch the standard profile page
function fetchProfile(profile, cb){
    // get rid of any weird characters
    profile = cleanupUsername(profile);
    
    // fetch PSN profile page
    fetch('/playstation/psn/profiles/'+profile, function(data){
        cb(data);
    });
}
exports.fetchProfile = fetchProfile;
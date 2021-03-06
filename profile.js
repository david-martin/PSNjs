var net = require("./net.js");

// profile configs
var lang = {
    0: "Japanese",
    1: "English (United States)",
    2: "French",
    3: "Spanish",
    4: "German",
    5: "Italian",
    6: "Dutch",
    7: "Portugese (Portugal)",
    8: "Russian",
    9: "Korean",
    10: "Traditional Chinese",
    11: "Simplified Chinese",
    12: "Finnish",
    13: "Swedish",
    14: "Danish",
    15: "Norwegian",
    16: "Polish",
    17: "Portuguese (Brazil)",
    18: "English (United Kingdom)"
};

// map countries to regions
var countries = {
    gb: "eu",
    nl: "eu",
    us: "us",
    fi: "eu",
    hk: "hk",
    fr: "eu",
    it: "eu",
    jp: "jp",
    ie: "eu",
    at: "eu",
    pt: "eu",
    dk: "eu",
    de: "eu",
    ca: "us",
    au: "eu",
    tw: "hk",
    es: "eu",
    ch: "eu",
    be: "eu",
    sa: "eu",
    no: "eu",
    gr: "eu",
    mx: "us",
    nz: "eu"
};

// cache
// TODO: write this somewhere (do these ever change? assume not)
var jid_cache = {};

// function to fetch profile picture
function getProfile(user, cb){
    // tidy up/verify username
    user = require("./tools.js").checkUsername(user);
    if (!user) return cb({error: "Invalid username (failed local test)"});
    
    // copy list of regions to check
    var r = [];
    for(var tmp in net.regions) r.push(net.regions[tmp]);
    
    // callback function to check if user exists
    var check_user = function(d, region){
        if (d.body.searchjid.jid){
            // save to cache!
            jid_cache[user] = {
                jid: d.body.searchjid.jid,
                region: region
            }
            
            // fetch profile data
            nextstep();
            
            return;
        }else{
            if (!r.length){
                cb({error: "Invalid username (no jid found)"});
            }else{
                check_region(r.shift());
            }
        }
    };
    
    // callback function to check a region
    var check_region = function(region){
        net.fetch(
            net.endpoints[region], 
            "<?xml version='1.0' encoding='utf-8'?><searchjid platform='ps3' sv='"+net.fw+"'><online-id>"+user+"</online-id></searchjid>",
            "basic",
            function(d){
                check_user(d, region);
            }
        );
    }
    
    var nextstep = function(){
        getProfileData(jid_cache[user].jid, jid_cache[user].region, cb);
    }
    
    if (jid_cache[user]){
        nextstep();
    }else{
        // start checking regions for user's jid
        check_region(r.shift());
    }
}
function getProfileData(jid, region, cb){
    net.fetch(
        net.profilepoints[region],
        "<profile platform='ps3' sv='"+net.fw+"'><jid>"+jid+"</jid></profile>",
        "basic",
        function(d){
            // fetch object out of xml for easier use
            var p = d.body.profile;
            
            // collect data we know will exist
            var res = {
                username:   p.onlinename[0],
                avatar:     p.avatarurl[0]['_'],
                country:    p.country[0],
                region:     country2region(p.country[0]),
                psplus:     (p.plusicon)?true:false
            };
            
            // some data that might not be present
            if (p.aboutme)  res.aboutme = p.aboutme[0];
            if (p.ucbgp)    res.colour = p.ucbgp[0].substring(p.ucbgp[0].length-8);
            
            // get list of languages
            res.lang = [];
            for(var i=1; i<4; i++){
                if (typeof(p['language'+i][0])!="object") {
                    var a = languages(p['language'+i][0]);
                    if (a) {
                        res.lang.push(a);
                    }
                }
            }
            
            // add panel if it exists!
            if (p.panelurl && p.panelurl[0]['$']){
                res.panel = p.panelurl[0]['_'];
                // if we haven't got a colour from this user, use their Vita one
                if (!res.colour) res.colour =    p.panelurl[0]['$'].bgc;
            }
            
            // fetch trophy stats!
            getProfileStats(jid, function(trop){
                // merge this object into our return object
                if (!trop.error){
                    for(var i in trop){
                        res[i] = trop[i];
                    }
                }
                
                // return
                cb(res);
            });
        }
    );
}
function getProfileStats(jid, cb){
    net.fetch(
        "http://trophy.ww.np.community.playstation.net/trophy/func/get_user_info",
        "<nptrophy platform='ps3' sv='"+net.fw+"'><jid>"+jid+"</jid></nptrophy>",
        "trophy",
        function(d){
            // tidy variable
            var t = d.body.nptrophy;
            
            // make a return object
            if (t.result > 0){
                // we received an error
                cb({error: "PSN returned error code "+t.result});
            }else{
                var res = {};
                if (t.level){
                    if (!t.level[0]['_']) t.level[0]['_'] = 0;
                    res = {
                        level:          parseInt(t.level[0]['_']),
                        points:         parseInt(t.point[0]),
                        points_floor:   parseInt(t.level[0]['$'].base),
                        points_next:    parseInt(t.level[0]['$'].next),
                        percent:        parseInt(t.level[0]['$'].progress),
                        trophies:{
                            platinum:   parseInt(t.types[0]['$'].platinum),
                            gold:       parseInt(t.types[0]['$'].gold),
                            silver:     parseInt(t.types[0]['$'].silver),
                            bronze:     parseInt(t.types[0]['$'].bronze)
                        }
                    };
                    // add up trophy totals
                    res.total = res.trophies.platinum +
                        res.trophies.gold +
                        res.trophies.silver +
                        res.trophies.bronze;
                    
                    // return!
                }else{
                    res = {
                        level:          0,
                        points:         0,
                        points_floor:   0,
                        points_next:    0,
                        percent:        0,
                        trophies:{
                            platinum:   0,
                            gold:       0,
                            silver:     0,
                            bronze:     0
                        },
                        total: 0
                    };
                }
                cb(res);
            }
        }
    );
}

function country2region(c){
    if (countries[c]) return countries[c];
    console.log("Unknown country code: "+c);
    return "unknown";
}

function languages(c){
    if (lang[c]) return lang[c];
    console.log("Unknown language: "+c);
    return false;
}

exports.fetch = getProfile;

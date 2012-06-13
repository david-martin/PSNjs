var net = require("./net.js");

// profile configs
// TODO - find more languages
var lang = {
    1: "English"
}

// cache
// TODO: write this somewhere (do these ever change? assume not)
var jid_cache = {};

// function to fetch profile picture
function getProfile(user, cb){
    // tidy up/verify username
    user = require("./tools.js").checkUsername(user);
    if (!user) return cb({error: "Invalid username (failed local test)"});
    
    // copy list of regions to check
    var r = net.regions;
    
    // callback function to check if user exists
    var check_user = function(d, region){
        if (d.body.searchjid.jid){
            // save to cache!
            jid_cache[user] = {
                jid: d.body.searchjid.jid,
                region: region
            }
            
            // fetch profile data
            getProfileData(d.body.searchjid.jid, region, cb);
            
            return;
        }else{
            if (!r){
                cb({error: "Invalid username (no jid found)"});
            }else{
                check_next_region();
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
    
    // shortcut function
    var check_next_region = function(){
        check_region(r.shift());
    }
    
    if (jid_cache[user]){
        getProfileData(jid_cache[user].jid, jid_cache[user].region, cb);
    }else{
        // start checking regions for user's jid
        check_next_region();
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
                username:   p.onlinename,
                avatar:     p.avatarurl.$t,
                country:     p.country,
                region:     country2region(p.country),
                psplus:     (p.plusicon)?true:false,
                aboutme:    p.aboutme
                //ptlp:       ??
            };
            if (p.ucbgp) res.colour = p.ucbgp.substring(p.ucbgp.length-8);
            
            if (p.language1 || p.language2 || p.language3) {
                res.lang = [];
                for(var i=1; i<4; i++){
                    var a = languages(p['language'+i]);
                    if (a){
                        res.lang.push(a);
                    }
                }
            }
            
            // add panel if it exists!
            if (p.panelurl){
                res.panel =     p.panelurl.$t;
                if (!res.colour) res.colour =    p.panelurl.bgc;
            }
            
            // fetch trophy stats!
            getProfileStats(jid, function(trop){
                // merge this object into our return object
                for(var i in trop){
                    res[i] = trop[i];
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
            var res = {
                level:          parseInt(t.level.$t),
                points:         parseInt(t.point),
                points_floor:   parseInt(t.level.base),
                points_next:    parseInt(t.level.next),
                percent:        parseInt(t.level.progress),
                trophies:{
                    platinum:   parseInt(t.types.platinum),
                    gold:       parseInt(t.types.gold),
                    silver:     parseInt(t.types.silver),
                    bronze:     parseInt(t.types.bronze)
                }
            };
            // add up trophy totals
            res.total = res.trophies.platinum +
                res.trophies.gold +
                res.trophies.silver +
                res.trophies.bronze;
            
            // return!
            cb(res);
        }
    );
}

function country2region(c){
    // TODO - resolve more of these
    if (c == "us") return "us";
    if (c == "jp") return "jp";
    return "eu";
}

function languages(c){
    if (lang[c]) return lang[c];
    return false;
}

exports.fetch = getProfile;

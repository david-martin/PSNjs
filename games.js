// this module gets PSN game information
var net = require("./net.js");

// map of profile compatible platforms
var platforms = {
    ps3:  "PlayStation 3",
    psp2: "PlayStation Vita"
};
exports.platforms = platforms;

function getGamesList(jid, cb){
    // now fetch game list from us.playstation.com
    // one day, we will use official lists. However, this currently has better overall results
    getCommGames(jid.match(/([^@]+)/)[1], cb);
}

function getOfficialGames(jid, cb){
    net.fetch(
        "http://trophy.ww.np.community.playstation.net/trophy/func/get_title_list",
        "<nptrophy platform='ps3' sv='"+net.fw+"'><jid>"+jid+"</jid><start>1</start><max>64</max><pf>ps3</pf><pf>psp2</pf></nptrophy>",
        "trophy",
        function(d){
            var games = [];
            for(var i=0; i<d.body.nptrophy.list.info.length; i++){
                var game = d.body.nptrophy.list.info[i];
                var g = {};
                
                // detect game platform
                if (platforms[ game['@'].pf ]){
                     g.platform = platforms[ game['@'].pf ];
                }else{
                    // write to log so we can detect new PlayStation platforms
                    console.log("UNKNOWN PLATFORM DETECTED :: "+game['@'].pf);
                     g.platform = "unknown";
                }
                
                // get game ID
                g.id = game['@'].npcommid;
                
                // last update
                g.updated = Date.parse(game['last-updated'])/1000;
                
                // list trophy counts
                g.trophies = {
                    platinum : game.types['@'].platinum,
                    gold     : game.types['@'].gold,
                    silver   : game.types['@'].silver,
                    bronze   : game.types['@'].bronze
                };
                
                // push to array
                games.push(g);
            }
            
            //return 
            cb(games);
        }
    );
}

// regexes for parsing profile pages
var regex_bits = /src="([^"]+)".*title="([^"]+)"/;
var regex_image = /http:\/\/trophy01.np.community.playstation.net\/trophy\/np\/((?:[^_]+)_[0-9]{2})/;
var regex_progress = /"gameProgressSortField">\s*?([0-9]+)/;

// fetch game title/icon from the US community site
function getCommGames(user, cb){
    user = require("./tools.js").checkUsername(user);
    if (!user) return cb({error: "Invalid username"});
    
    require("./net.js").fetch("http://us.playstation.com/playstation/psn/profile/"+user+"/get_ordered_trophies_data", {
        referer: "http://us.playstation.com/playstation/psn/profiles/"+user
    }, function(data){
        var games = [];
        // split data into games
        data = data.body.split("titlelogo");
        
        // loop through and parse
        for(var i=1; i<data.length; i++){
            // extract game title and icon
            var m = regex_bits.exec(data[i]);
            // extract ncommid from image
            var img = regex_image.exec(m[1]);
            // extract completion percent
            var perc = regex_progress.exec(data[i]);
            
            // fetch trophy counts
            var regex_trophycount = /class="trophycontent">\s*?([0-9]+)/g;
            var trophies = [];
            var counts = regex_trophycount.exec(data[i]);
            while (counts !== null){
                trophies.push(counts[1]);
                counts = regex_trophycount.exec(data[i]);
            }
            
            // store this game in games array
            games.push({
                id: img[1],
                title: m[2],
                icon: m[1],
                complete: perc[1],
                trophies: {
                    platinum: trophies[3],
                    gold: trophies[2],
                    silver: trophies[1],
                    bronze: trophies[0]
                }
            });
        }
        
        cb(games);
    });
}

exports.getUserGames = getGamesList;

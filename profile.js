// define profile regexes for searching HTML
// possible values:
//  regex (required): used for finding data
//  def (optional)  : used if data not found (will be blank if this is not specified)
//  post (optional) : function to use on data to tidy/neaten whatever
var fields = {
    "pic":{
        regex:  /\/playstation\/PSNImageServlet\?avtar=([^\"]*)/i,
        def:    "http://assets.np.us.playstation.com/avatar/default/DefaultAvatar.png",
        post:   function(d){
            return d.replace(/_s/g, "");
        }
    },
    "level":{
        regex:  /<div id="leveltext">(?:\s+)([0-9]*)/i,
        def:    0
    },
    "trophies":{
        regex:  /<strong>TROPHIES<\/strong><\/div>(?:\s+)?<div id="text">(?:\s+)?([0-9]*)/i,
        def:    0
    },
    "levelprogress":{
        regex:  /<div class="progresstext">(?:\s+)?([0-9]*)%/i,
        def:    0
    },
    "platinum":{
        regex:  /<div class="text platinum">([0-9]*)/i,
        def:    0
    },
    "gold":{
        regex:  /<div class="text gold">([0-9]*)/i,
        def:    0
    },
    "silver":{
        regex:  /<div class="text silver">([0-9]*)/i,
        def:    0
    },
    "bronze":{
        regex:  /<div class="text bronze">([0-9]*)/i,
        def:    0
    }
};

// function to fetch profile picture
function fetch(profile, field, cb){
    // allow the second argument to be a callback instead for all fields
    if (!cb){
        cb = field;
        field = null;
    }
    
    // fetch PSN profile page
    require("./tools.js").fetchProfile(profile, function(data){
        if (field === null){
            var o = {username: profile};
            for(var a in fields){
                o[ a ] = parse(data, a);
            }
            cb(o);
        }else{
            cb(parse(data, field));
        }
    });
}
exports.fetch = fetch;

function parse(data, field){
    // check this regex actually exists
    if (fields[ field ]){
        var m = data.match(fields[ field ].regex);
        if (m){
            if (fields[ field ].post){
                return fields[ field ].post(m[1]);
            }else{
                return m[1];
            }
        }else{
            if (fields[ field ].def){
                return fields[ field ].def;
            }else{
                return "";
            }
        }
    }else{
        return "";
    }
}
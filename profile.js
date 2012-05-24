var regex_pic = /\/playstation\/PSNImageServlet\?avtar=([^\"]*)/i;

// function to fetch profile picture
function pic(profile, cb){
    // fetch PSN profile page
    require("./tools.js").fetchProfile(profile, function(data){
        var matches = data.match(regex_pic);
        if (matches){
            cb(matches[1].replace(/_s/g, ""));
        }else{
            cb("http://assets.np.us.playstation.com/avatar/default/DefaultAvatar.png");
        }
    });
}
exports.pic = pic;
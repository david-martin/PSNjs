// abstract layer to just tidy everything up for use

// === profile functions
// NOTE: if you're grabbing more than one, just grab the whole lot to save multiple fetches
// Grab all user data (this is just as fast as fetching individual data items, so you should usually use this)
exports.profile = require("./profile.js").fetch;
// Grab user's avatar image
exports.avatar = function(profile, cb){
    require("./profile.js").fetch(profile, "pic", cb);
};
// Grab user's level
exports.avatar = function(profile, cb){
    require("./profile.js").fetch(profile, "level", cb);
};
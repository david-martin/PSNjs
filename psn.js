// abstract layer to just tidy everything up for use

// === profile functions
exports.profile = require("./profile.js").fetch;

exports.games = require("./games.js").getUserGames;
# PSN.js

*PSN.js* A simple library for fetching PSN profile data in Node.JS

## Example Use

    require("psn.js/psn.js").profile("cubehouse", function(data){
      console.log(data);
    });

## Profile Object

- username (PSN Username)
- avatar (PSN Avatar)
- country (user's country code)
- region (us/eu/jp - WIP)
- psplus (does this user have PlayStation Plus?)
- aboutme (PSN profile about me comment - may not be present)
- lang (array of user's languages - WIP - may not be present)
- level (user's current PSN level)
- panel (panel image from PS Vita - may not be present)
- colour (user's profile colour - may not be present)
- trophies (object of trophy counts - platinum, gold, silver and bronze)
- total (total trophy count)
- points (current level points)
- points_floor (points required for user's current level)
- points_next (points required for user's next level)
- percent (percent complete to next level)

## Future Versions

- Fetch detailed trophy data
- Specify whether to fetch trophy count or profile data
- Caching
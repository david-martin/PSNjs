# PSN.js

*PSN.js* A simple library for fetching PSN profile data in Node.JS

## Example Use

    require("psn.js/psn.js").profile("cubehouse", function(data){
      console.log(data);
    });

## Profile Object

- username (PSN Username)
- pic (PSN Avatar)
- level
- trophies (total trophy count)
- platinum
- gold
- silver
- bronze
- levelprogress (Percentage to the next level)

## Future Versions

Use direct calls to PSN for more data (full profile data, PSN+ status, colour etc.)
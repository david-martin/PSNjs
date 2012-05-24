# PSN.js

*PSN.js* A simple library for fetching PSN profile images in Node.JS

## Example Use

    require("psn.js/psn.js").avatar("cubehouse", function(avatar){
      console.log("<img src='"+avatar+"' />");
    });

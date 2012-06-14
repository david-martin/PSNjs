# PSNjs

*PSNjs* A simple library for fetching PSN profile data in Node.JS

## Installing

    npm install -g PSNjs

Alternatively, add PSNjs to your package file or local install with 'npm install PSNjs'.

## Installing from Git

Clone the repo. cd into the directory and link to gain access to PSNjs on your system.

    git clone https://github.com/cubehouse/PSNjs.git
    cd PSNjs
    sudo npm link

## Example Use

    require("PSNjs").profile("cubehouse", function(data){
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
- colour (user's profile colour in rgba format - may not be present)
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

## Web Service

An example web service is included. By default is runs on port 2265 (will be configurable later).

    node webservice/web.js

Load localhost:2265/get/user/username (or whatever) to get a dataset.

This is very barebones and currently is just a demo.

## Thanks

A massive thank you has to go to the PSNAPI website for documenting so much information so clearly.

http://psnapi.org/

If this is useful, please support them.

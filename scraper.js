// Node Module Requirements
const fs = require('fs');
// Package Requirements
const rp = require('request-promise');
const cheerio = require('cheerio');
// check for data folder
function checkDirectory(directory) {
  if (fs.existsSync(directory) === false) {
    fs.mkdirSync(directory);
  } else {
    return;
  };
};
checkDirectory('./data');
// Create options object
const options = {
  uri: 'http://shirts4mike.com/shirts.php',
  transform: function(body) {
    return cheerio.load(body);
  }
};
// Make request
rp(options)
  .then($ => console.log($))
  .catch(err => console.log(err))

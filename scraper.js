// Module requirements
const fs = require('fs');
const path = require('path');
const request = require('request');
const cheerio = require('cheerio');
const rp = require('request-promise');
const Json2csvParser = require('json2csv').Parser;

// Create CSV Parser
const fields = ['Title', 'Price', 'ImageURL', 'URL', 'Time'];
const json2csvParser = new Json2csvParser({ fields });

// Array to hold product URIs
let uriArr = [];
// Array to hold product data
let productArr = [];
// global index counter
let n = 0;

// Create date object
const date = new Date();
// Print formatted date
function printDate() {
  const year = date.getFullYear();
  const month = function() {
    if (date.getMonth() < 9) {
      return `0${date.getMonth() + 1}`;
    } else {
      return date.getMonth() + 1;
    }
  };
  const day = function() {
    if (date.getDate() < 10) {
      return `0${date.getDate()}`;
    } else {
      return date.getDate();
    }
  };
  return `${year}-${month()}-${day()}`
};
// Print formatted time
function printTime() {
  const hour = function() {
    if (date.getHours() < 10) {
      return `0${date.getHours()}`;
    } else {
      return date.getHours();
    }
  };
  const minutes = function() {
    if (date.getMinutes() < 10) {
      return `0${date.getMinutes()}`;
    } else {
      return date.getMinutes();
    }
  };
  return `${hour()}:${minutes()}`;
};


// Delete Old Data Files
function removeFiles() {
  const directory = 'data';
  fs.readdir(directory, (err, files) => {
    if (err) handle(err);

    for (const file of files) {
      fs.unlink(path.join(directory, file), err => {
        if (err) handle(err);
        console.log('old files were deleted');
      });
    }
  });
}

// Check for data directory and create one if it doesn't exist
if (fs.existsSync('data')) {
  console.log('There is a data directory');
  //Remove old files:
  removeFiles();
} else {
  fs.mkdirSync('data');
  console.log('Data directory created!');
}

// Individual product request function
function productRequest(uri) {
  let options = {
    uri: `http://www.shirts4mike.com/${uri}`,
    transform: function (body) {
      return cheerio.load(body);
    }
  };
  rp(options)
    .then($ => {
      let productData = {
          "Title" :
            $('div.shirt-details > h1')
              .contents()
              .filter(function() {
                return this.nodeType == 3;
              })
              .text()
              .slice(1),
          "Price" : $('div.shirt-details > h1 > span.price').text(),
          "ImageURL" : $('div.shirt-picture > span > img').attr('src'),
          "URL" : options.uri,
          "Time" : `${date.getHours()}:${date.getMinutes()}`
      };
      productArr.push(productData);
      if (n < (uriArr.length - 1)) {
        n ++;
        productRequest(uriArr[n]);
      } else {
        let csvData = json2csvParser.parse(productArr);
        fs.writeFile(`data/${printDate()}.csv`, csvData, 'utf8', err => {
          if (err) {
            console.log('There was an error writing the file.');
          } else {
            console.log('File written and saved.');
          };
        })
      };
    })
    .catch(err => console.log(`There was a ${err.statusCode} error. Execution incomplete.`))
};

// Master request function
function masterRequest() {
  let options = {
    uri: 'http://www.shirts4mike.com/shirts.php1111',
    transform: function (body) {
      return cheerio.load(body);
    }
  };
  rp(options)
  .then($ => {
    const $productLinks = $('div.shirts').find('a');
    $productLinks.each(i => uriArr[i] = $productLinks[`${i}`].attribs.href);
    productRequest(uriArr[n]);
  })
  .catch(err => console.log(`There was a ${err.statusCode} error. Execution incomplete.`))
}
masterRequest();

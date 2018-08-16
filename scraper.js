// Node Module Requirements
const fs = require('fs');
// Package Requirements
const request = require('request');
const cheerio = require('cheerio');
// const csv = require('json2csv');
const csvParse = require('json2csv').Parser;

// Check for data folder
function checkDir(path) {
  if (fs.existsSync(path) === false) {
    fs.mkdirSync(path);
  } else {
    return;
  }
};
checkDir('./data');

// Generate current date (for filename)
function generateDate() {
  let today = new Date();
  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
};

// Create CSV
function createCSV(path) {
  fs.writeFileSync(path)
};
createCSV(`./data/${generateDate()}.csv`)
// Fields for JSON2CSV
const fields = ['Title', 'Price', 'ImageURL', 'URL', 'Time'];

// Request function for each product page
function productRequest(uri) {
  request(`http://shirts4mike.com/${uri}`, function(error, response, html) {
    if (!error && response.statusCode === 200) {
      let $ = cheerio.load(html);
      let productInfo = {
        title : $('div.shirt-details > h1')
          .contents()
          .filter(function() {
              return this.nodeType == 3;
          })
          .text()
          .slice(1),
        price : $('div.shirt-details > h1 > span.price').text(),
        imgUrl : $('div.shirt-picture > span > img').attr('src'),
        url : `http://shirts4mike.com/${uri}`
      };
      let productJSON = JSON.stringify(productInfo);
      console.log(productJSON);
      return productJSON;
    }
  });
};


//  Make request
request('http://shirts4mike.com/shirts.php', function(error, response, html) {
  if (!error && response.statusCode === 200) {
    let $ = cheerio.load(html);
    // Create array of all product page URIs
    let linksArr = [];
    const $productLinks = $('div.shirts').find('a');
    $productLinks.each(i => linksArr[i] = $productLinks[`${i}`].attribs.href);
    const Json2CsvParse = new csvParse({ fields });
    // Call requests on each product pages
    linksArr.forEach(link => {
      let productData = productRequest(link);
      console.log(productData);
    });
  }
});

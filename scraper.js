// Module requirements
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
let productArr = []
let productData;
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
      productData = {
          "title" :
            $('div.shirt-details > h1')
              .contents()
              .filter(function() {
                return this.nodeType == 3;
              })
              .text()
              .slice(1),
          "price" : $('div.shirt-details > h1 > span.price').text(),
          "imageURL" : $('div.shirt-picture > span > img').attr('src'),
          "URL" : options.uri
      };
      return productData;
    })
    .then(data => {
      console.log(data);
      const csv = json2csvParser.parse(data);
      console.log(csv);
    })
    .catch(err => {
      console.log(err);
    });
}
// productRequest('shirt.php?id=101');

// Master request function
function masterRequest() {
  let options = {
    uri: 'http://www.shirts4mike.com/shirts.php',
    transform: function (body) {
      return cheerio.load(body);
    }
  };
  rp(options)
  .then($ => {
    const $productLinks = $('div.shirts').find('a');
    $productLinks.each(i => uriArr[i] = $productLinks[`${i}`].attribs.href);
  })
  .then($ =>  {
    uriArr.forEach(productURI => productRequest(productURI))
  })
  .then($ => {

  })
};
masterRequest();

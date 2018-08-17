// Node Module Requirements
const fs = require('fs');
// Package Requirements
const request = require('request');
const rp = require('request-promise');
const cheerio = require('cheerio');
const json2csvParser = require('json2csv').Parser;
  // Fields for JSON2CSV


// Check for data folder
function checkDir(path) {
  if (fs.existsSync(path) === false) {
    fs.mkdirSync(path);
  } else {
    return;
  }
};
checkDir('./data');

let productArray= [];

function productRequest(uri) {
  // declare options object for request-promise
  let options = {
    uri: `http://shirts4mike.com/${uri}`,
    transform: function(body) {
      return cheerio.load(body)
    }
  };
  // call request promise
  rp(options)
    .then(function(res) {
      let $ = cheerio.load(`http://shirts4mike.com/${uri}`);
      let productInfo = {
        title : $('div.shirt-details > h1')
          .contents()
          .filter(function() {
            return this.nodeType == 3;
          })
          .text()
          .slice(1),
        price : $('div.shirt-details > h1 > span.price').text(),
        imageUrl : $('div.shirt-picture > span > img').attr('src'),
        url : `http://shirts4mike.com/${uri}`
      }
      productArray.push(productInfo)
    })
    .then($ => {
      console.log(productArray);
    })
};
productRequest('shirt.php?id=101');

// // Generate current date (for filename)
// function generateDate() {
//   let today = new Date();
//   return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
// };
//
// // Create CSV
// function createCSV(path) {
//   fs.writeFileSync(path)
// };
// createCSV(`./data/${generateDate()}.csv`)
//
// // Create CSV Parse
// var JSONArray = [];
// // Request function for each product page
// function productRequest(uri) {
//   request(`http://shirts4mike.com/${uri}`, function(error, response, html) {
//     if (!error && response.statusCode === 200) {
//       let $ = cheerio.load(html);
//       let productInfo = {
//         title : $('div.shirt-details > h1')
//           .contents()
//           .filter(function() {
//               return this.nodeType == 3;
//           })
//           .text()
//           .slice(1),
//         price : $('div.shirt-details > h1 > span.price').text(),
//         imageUrl : $('div.shirt-picture > span > img').attr('src'),
//         url : `http://shirts4mike.com/${uri}`
//       };
//
//       JSONArray.push(productInfo);
//       // console.log(JSONArray);
//     };
//   });
// };
// try {
//   productRequest(`shirt.php?id=101`)}
//
// console.log(JSONArray);
// // let data = [
// //   { yo: 'hey',
// //     no: 'way',
// //     ha: 'tay'
// //   }
// // ]
// const fields = ['title', 'price', 'imageUrl', 'url'];
// const opts = { fields };
// //
// const json2csv = new json2csvParser({ fields });
// const csv = json2csv.parse(JSONArray);
// console.log(csv);
//
// // //  Make request
// // request('http://shirts4mike.com/shirts.php', function(error, response, html) {
// //   if (!error && response.statusCode === 200) {
// //     let $ = cheerio.load(html);
// //     // Create array of all product page URIs
// //     let linksArr = [];
// //     const $productLinks = $('div.shirts').find('a');
// //     $productLinks.each(i => linksArr[i] = $productLinks[`${i}`].attribs.href);
// //     // Call requests on each product pages
// //     console.log(linksArr);
// //     $(linksArr).each(i => console.log(productRequest(linksArr[i])));
// //   }
// // });

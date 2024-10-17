const https = require('https');
const cheerio = require('cheerio');

const targetHost = 'www.salamander.md';
const targetPath = '/ro';

function fetchPage(host, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: host,
      port: 443, // HTTPS port
      path: path,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0',
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      // Handle redirects (301, 302)
    //   if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
    //     return fetchPage(host, res.headers.location.replace(`https://${host}`, ''))
    //       .then(resolve)
    //       .catch(reject);
    //   }

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        resolve(responseData);
      });
    });

    req.on('error', (err) => {
      reject('There has been a problem with your fetch operation: ' + err.message);
    });

    req.end();
  });
}

fetchPage(targetHost, targetPath)
  .then(html => {
    // console.log('HTML fetched:', html);

    const $ = cheerio.load(html);

    const products = [];
    const productElements = $('.product-card');

    productElements.each((index, element) => {
      const nameElement = $(element).find('.product-title');
      const name = nameElement ? nameElement.text().trim() : 'Name doesn\'t exist';

      const priceElement = $(element).find('.text-accent');
      const price = priceElement ? priceElement.text().trim() : 'Price doesn\'t exist';

      const floatPrice = parseFloat(price);

      const validatedName = name.replace(/\s+/g, ' ').trim();

      if (validatedName && floatPrice) {
        products.push({ validatedName, floatPrice });
      }
    });

    console.log(products);
  })
  .catch(error => {
    console.error(error);
  });

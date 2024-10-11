const targetUrl = 'https://www.salamander.md/ro';
const proxyUrl = 'http://localhost:8080/';

fetch(proxyUrl + targetUrl)
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok: ' + response.statusText);
    }
    return response.text();
  })
  .then(html => {
   
    // console.log(html);

    const parser = new DOMParser();

    const doc = parser.parseFromString(html, 'text/html');

    const products = [];

    const productElements = doc.querySelectorAll('.product-card'); 

    // console.log('Amount of found products:', productElements.length);

    productElements.forEach(element => {
     
      const nameElement = element.querySelector('.product-title');
      const name = nameElement ? nameElement.innerText.trim() : 'Name doesnt exist'; 

      const priceElement = element.querySelector('.text-accent');
      const price = priceElement ? priceElement.innerText.trim() : 'Price doesnt exist'; 

      if (name && price) {
        products.push({ name, price });
      }
    });

    // console.log(products);
  })
  .catch(error => {
    console.error('There has been a problem with your fetch operation:', error);
  });

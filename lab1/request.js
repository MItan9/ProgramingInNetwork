const targetUrl = 'https://www.salamander.md/ro';
const proxyUrl = 'http://localhost:8080/';

                                    //  FIRST TASK

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


                                    //  SECOND TASK
    const products = [];

    const productElements = doc.querySelectorAll('.product-card'); 

    productElements.forEach(element => {
     
      const nameElement = element.querySelector('.product-title');
      const name = nameElement ? nameElement.innerText.trim() : 'Name doesnt exist'; 

      const priceElement = element.querySelector('.text-accent');
      const price = priceElement ? priceElement.innerText.trim() : 'Price doesnt exist'; 
    //   console.log(typeof price); // "string"


                                    //  FOURTH TASK
      const floatPrice = parseFloat(price);
    //   console.log(typeof floatPrice); // "number"

    const validatedName = name.replace(/\s+/g, ' ').trim(); // replace 2 and more spaces with one space

    if (!validatedName || validatedName.length === 0) {
      console.error('Invalid product name. Skipping product.');
      return; 
    }

      if (validatedName && floatPrice) {
        products.push({ validatedName, floatPrice}); 
      }
    });

    console.log(products);

                                      //  THIRD TASK

     const additionalProducts = [];   
     
     productElements.forEach(element => {

        const linkElement = element.querySelector('a.card-img-top');
        let link = linkElement ? linkElement.href : null; 
        
        if (link) {
            link = link.replace(/^file:\/\/\/C:[^/]*/, ''); 
            link = link.replace(/\/ro/, ''); 
            additionalProducts.push({ link}); 
        }
      });
    //  const maxRequests = Math.min(products.length, 10); 

    // for (let i = 0; i < maxRequests; i++) {
    //   scrapeProductData(additionalProducts[i].link); 
    // }

    additionalProducts.forEach(product => {
        scrapeProductData(product.link); 
      });


                                      //  FIFTH TASK

    const minPrice = 80; 
    const maxPrice = 110; 
    const EUR = 0.05;

    const newPriceList = products.map(product => {
        const convertedPrice = product.floatPrice * EUR; 
        return { ...product, price: convertedPrice }; 
    });
    
    const filteredProducts = newPriceList.filter(product => 
        product.price >= minPrice && product.price <= maxPrice 
    );
                                        
    const totalPrice = filteredProducts.reduce((sum, product) => sum + product.price, 0);
        
    const newProductList = {
    products: filteredProducts,
    totalPrice,
    timestamp: new Date().toISOString() 
    };
                                    
    console.log(newProductList); 

    

  })
  .catch(error => {
    console.error('There has been a problem with your fetch operation:', error);
  });



  function scrapeProductData(productLink) {
    fetch(proxyUrl + targetUrl + productLink)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.text();
      })
      .then(html => {

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
  
        const articleElement = doc.querySelector('#product-article .h6.fw-bold'); 
        const article = articleElement ? articleElement.innerText.trim() : 'Article not found';
  
        // console.log('Product Article:', article);
      })
      .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
      });

    }

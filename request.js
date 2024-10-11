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

    // console.log('Amount of found products:', productElements.length);

    productElements.forEach(element => {
     
      const nameElement = element.querySelector('.product-title');
      const name = nameElement ? nameElement.innerText.trim() : 'Name doesnt exist'; 

      const priceElement = element.querySelector('.text-accent');
      const price = priceElement ? priceElement.innerText.trim() : 'Price doesnt exist'; 

      console.log(typeof price);

      const linkElement = element.querySelector('a.card-img-top');
      let link = linkElement ? linkElement.href : null; 
  

      if (link) {
        link = link.replace(/^file:\/\/\/C:[^/]*/, ''); 
        link = link.replace(/\/ro/, ''); 
        products.push({ name, price, link }); 
      }


    });

    // console.log(products);

                                      //  THIRD TASK
     const maxRequests = Math.min(products.length, 10); 
    for (let i = 0; i < maxRequests; i++) {
      scrapeProductData(products[i].link); 
    }


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
  
  
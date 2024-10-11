const targetUrl = 'https://www.smart.md/';
const proxyUrl = 'http://localhost:8080/';

fetch(proxyUrl + targetUrl)
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok: ' + response.statusText);
    }
    return response.text();
  })
  .then(html => {
    console.log(html);
  })
  .catch(error => {
    console.error('There has been a problem with your fetch operation:', error);
  });

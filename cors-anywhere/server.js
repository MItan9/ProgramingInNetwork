const corsAnywhere = require('cors-anywhere');

const host = '0.0.0.0'; 
const port = 8080; 

corsAnywhere.createServer().listen(port, host, () => {
  console.log(`CORS Anywhere is running on ${host}:${port}`);
});

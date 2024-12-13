// const ftp = require('basic-ftp');
// const fs = require('fs');
// const axios = require('axios');
// const path = require('path');
// const FormData = require('form-data');

// const FTP_CONFIG = {
//     host: "ftp_server",
//     port: 21,
//     user: "testuser",
//     password: "testpass"
// };

// const FTP_DIR = "/home/testuser";
// const PROCESSED_FILE_NAME = "processed_data.txt";
// const LAB2_SERVER_URL = "http://lab2_server:3000/upload";

// // Function to process JSON file data
// function processData(data) {
//     const parsedData = JSON.parse(data);
//     return `Name: ${parsedData.name}\nValue: ${parsedData.value}\nTimestamp: ${new Date().toISOString()}`;
// }

// // Function to fetch a local JSON file from the script's directory
// function fetchLocalFile() {
//     try {
//         const scriptDir = path.dirname(__filename);
//         const filePath = path.join(scriptDir, "local_data.txt");
//         const fileContent = fs.readFileSync(filePath, 'utf-8').trim();

//         if (!fileContent) {
//             throw new Error("File is empty.");
//         }

//         JSON.parse(fileContent); // Validate JSON format
//         return fileContent;
//     } catch (err) {
//         console.error(`Error reading local JSON file: ${err.message}`);
//         throw new Error("Invalid JSON in local_data.txt or file not found.");
//     }
// }

// // Function to upload a file to the FTP server
// async function uploadFile(content) {
//     const client = new ftp.Client();
//     client.ftp.verbose = true;

//     try {
//         // Connect to the FTP server
//         await client.access(FTP_CONFIG);

//         // Navigate to the target directory
//         await client.cd(FTP_DIR);

//         // Create a Buffer from the content
//         const buffer = Buffer.from(content, 'utf-8');

//         // Upload the file
//         await client.uploadFrom(buffer, PROCESSED_FILE_NAME);
//         console.log("File uploaded successfully.");
//     } catch (err) {
//         console.error(`Error uploading file: ${err.message}`);
//     } finally {
//         client.close();
//     }
// }

// // Function to send the file to the LAB2 server
// async function sendToLab2Server(fileContent) {
//     try {
//         const formData = new FormData();

//         // Use Buffer to append the file content
//         const buffer = Buffer.from(fileContent, 'utf-8');
//         formData.append('file', buffer, PROCESSED_FILE_NAME);

//         // Send the data
//         const response = await axios.post(LAB2_SERVER_URL, formData, {
//             headers: {
//                 ...formData.getHeaders()
//             }
//         });

//         console.log(`Sent to LAB2 server: ${response.status} - ${response.statusText}`);
//     } catch (err) {
//         console.error(`Error sending file to LAB2 server: ${err.message}`);
//     }
// }

// // Main task to run every 30 seconds
// async function ftpTask() {
//     try {
//         console.log("Fetching local JSON file...");
//         const fileContent = fetchLocalFile();

//         console.log("Processing JSON file data...");
//         const processedContent = processData(fileContent);

//         console.log("Uploading processed file to FTP server...");
//         await uploadFile(processedContent);

//         console.log("Sending processed file to LAB2 server...");
//         await sendToLab2Server(processedContent);
//     } catch (err) {
//         console.error(`Task error: ${err.message}`);
//     }
// }

// // Run the task periodically
// setInterval(ftpTask, 30000);

// console.log("FTP task running. Press Ctrl+C to exit.");





const fs = require('fs');
const path = require('path');
const ftp = require('basic-ftp');
const fetch = require('node-fetch');
const FormData = require('form-data');

const FTP_HOST = 'ftp_server'; // Update as needed
const FTP_PORT = 21;
const FTP_USER = 'testuser';
const FTP_PASSWORD = 'testpass';
const FTP_FILE_PATH = '/home/testuser/input.txt';
const PROCESSED_FILE_PATH = './processed_data.txt';
const LAB2_SERVER_URL = 'http://lab2_server:3000/upload';

// Function to process file data (map/filter/reduce logic from LAB1)
function processData(data) {
  const lines = data.split('\n').filter(line => line.trim() !== '');
  const mappedData = lines.map(line => line.toUpperCase());
  const reducedData = mappedData.reduce((acc, line) => acc + line + '\n', '');
  return reducedData;
}

// Function to fetch the file from FTP server
async function fetchFileFromFTP() {
  const client = new ftp.Client();
  client.ftp.verbose = true;
  try {
    await client.access({
      host: FTP_HOST,
      port: FTP_PORT,
      user: FTP_USER,
      password: FTP_PASSWORD,
    });
    const tempFile = path.join(__dirname, 'temp_input.txt');
    await client.downloadTo(tempFile, FTP_FILE_PATH);
    const fileData = fs.readFileSync(tempFile, 'utf-8');
    fs.unlinkSync(tempFile); // Clean up temporary file
    return fileData;
  } catch (err) {
    console.error('Error fetching file from FTP:', err);
    throw err;
  } finally {
    client.close();
  }
}

// Function to upload file to FTP server
async function uploadFileToFTP(filePath) {
  const client = new ftp.Client();
  client.ftp.verbose = true;
  try {
    await client.access({
      host: FTP_HOST,
      port: FTP_PORT,
      user: FTP_USER,
      password: FTP_PASSWORD,
    });
    await client.uploadFrom(filePath, FTP_FILE_PATH);
    console.log('File uploaded to FTP server successfully.');
  } catch (err) {
    console.error('Error uploading file to FTP:', err);
    throw err;
  } finally {
    client.close();
  }
}

// Function to send file to LAB2 web server
async function sendFileToServer(filePath) {
  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));

    const response = await fetch(LAB2_SERVER_URL, {
      method: 'POST',
      body: form,
    });

    if (response.ok) {
      console.log('File sent to LAB2 server successfully.');
    } else {
      console.error('Error sending file to LAB2 server:', response.statusText);
    }
  } catch (err) {
    console.error('Error in sending file to LAB2 server:', err);
  }
}

// Main thread function
async function main() {
  try {
    console.log('Fetching file from FTP server...');
    const fileData = await fetchFileFromFTP();

    console.log('Processing file data...');
    const processedData = processData(fileData);

    console.log('Saving processed data to file...');
    fs.writeFileSync(PROCESSED_FILE_PATH, processedData, 'utf-8');

    console.log('Uploading processed file back to FTP server...');
    await uploadFileToFTP(PROCESSED_FILE_PATH);

    console.log('Sending file to LAB2 server...');
    await sendFileToServer(PROCESSED_FILE_PATH);
  } catch (err) {
    console.error('Error in main thread:', err);
  }
}

// Run the main thread every 30 seconds
setInterval(main, 30000);

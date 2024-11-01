const express = require('express');
const multer = require('multer');
const app = express();

// Configure multer for saving uploaded files
const upload = multer({ dest: 'uploads/' }); // Specifies the directory to save files

// Route for file uploads
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('File not uploaded');
    }

    // Here req.file contains information about the uploaded file
    res.send({
        message: 'File uploaded successfully',
        file: req.file
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

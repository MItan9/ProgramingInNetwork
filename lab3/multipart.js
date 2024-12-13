
const express = require('express');
const multer = require('multer');

const app = express();
const upload = multer({ dest: 'uploads/' }); // Сохраняет файлы в папку uploads

app.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send({ message: 'No file uploaded' });
  }
  console.log('Received file:', file);
  res.send({ message: 'File uploaded successfully', file });
});

app.listen(3001, () => {
  console.log('LAB2 Web server running on http://localhost:3001');
});

import express from 'express';
import multer from 'multer';

const app = express();

// Set up Multer for handling multiple files
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, 'uploads/');
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  },
});

const upload = multer({ storage: storage }).array('images', 5); // 'images' is the field name for multiple files

// Your route for handling the upload
app.post('/upload', (req, res) => {
  upload(req, res, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(200).json({ message: 'Files uploaded successfully' });
  });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

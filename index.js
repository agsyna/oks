const express = require("express");
const mongoose = require("mongoose");
// const config = require("config");
const multer = require('multer');
const Grid = require("gridfs-stream");
const authRouter = require("./routes/auth");
const File = require("./models/file");
const User = require("./models/user");
const upload = require('./storage');
const { Readable } = require("stream");


const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(authRouter);

const DB = "mongodb+srv://syna:syna%401234@cluster0.5qwieuf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(DB)
  .then(() => {
    console.log("Connection Successful");
  })
  .catch((e) => {
    console.log(e);
  });
  
<<<<<<< HEAD
  app.get('/details', (req, res) => {
    res.send("works here");
});

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const newFile = new File({
      filename: req.file.filename,
      path: req.file.id.toString(),
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadDate: req.file.uploadDate
    });

    await newFile.save();

    res.status(200).json({
      message: 'File uploaded successfully',
      file: req.file,
    });
  } catch (error) {
    res.status(400).json({
      message: 'Failed to upload file',
      error: error.message,
    });
  }
});

//To display the uploaded files
app.get('/files', async (req, res) => {
  try {
    // res.send("works here");
    const files = await File.find();
    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve files', error: error.message });
  }
});

=======
//   app.get('/details', (req, res) => {
//     res.send("works here");
// ;})
>>>>>>> 8195619a69655c3f9c5ba1cc11c8db433126cc15
app.listen(PORT, "0.0.0.0", () => {
  console.log(`connected at port ${PORT}`);
});
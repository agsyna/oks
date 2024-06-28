const express = require("express");
const mongoose = require("mongoose");
const auth = require("./middleware/auth");
const authRouter = require("./routes/auth");
const User = require("./models/user");
const upload = require("./storage");
let path = require("path");
const fs = require("fs");

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(authRouter);
app.use(express.static(__dirname + "/public/assets"));

const DB =
  "mongodb+srv://syna:syna%401234@cluster0.5qwieuf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(DB)
  .then(() => {
    console.log("Connection Successful");
  })
  .catch((e) => {
    console.log(e);
  });

app.get("/works", (req, res) => {
  res.status(200).json({
    message: "server works",
  });
});

app.post("/upload", auth, upload.single("file"), (req, res) => {
  const file = req.file;
  if (!file) {
    res.status(400).json({
      message: "Failed to upload file",
    });
  } else {
    res.status(200).json({
      message: "File uploaded successfully",
      filename: file.filename.toString(),
    });
  }
});

//To read the sheet
app.get("/files", auth, async (req, res) => {
  const user = await User.findById(req.user);
  const directoryPath = path.join(
    __dirname,
    "/json/" + user.departmentnumber + ".json"
  );
  fs.readFile(directoryPath, "utf8", (err, data) => {
    if (err) {
      console.log(err);
      res.status(400).json({
        message: "Error in read /files",
      });
    } else {
      res.status(200).json(JSON.parse(data));
    }
  });
});

//to enter jsondata from designated files
app.post("/entry", auth, async (req, res) => {
  try {
    const { eventname, date, natureofevent, filename } = req.body;
    const user = await User.findById(req.user);

    var entries = {
      eventname: eventname,
      date: date,
      natureofevent: natureofevent,
      filename: filename,
    };

    const jsonfilename = path.join(
      __dirname,
      "/json/" + user.departmentnumber + ".json"
    );

    fs.readFile(jsonfilename, "utf8", (err, data) => {
      if (err) {
        console.log(err);
        res.status(400).json({
          message: "Error in read",
        });
      } else {
        data = JSON.parse(data);
        data.push(entries);
        fs.writeFile(jsonfilename, JSON.stringify(data), (err) => {
          if (err) {
            console.log(err);
            res.status(400).json({
              message: "File update failed",
            });
          } else {
            res.status(200).json({
              message: "File updated",
            });
          }
        });
      }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

//to delete jsondata and designated files
app.post("/delete", auth, async (req, res) => {
  try {
    const { filename } = req.body;
    if (filename == null || filename == undefined) {
      return res.status(400).json({
        message: "[DELETE] filename not found",
      });
    }
    const user = await User.findById(req.user);

    const jsonfilename = path.join(
      __dirname,
      "/json/" + user.departmentnumber + ".json"
    );

    const directoryPath = path.join(
      __dirname,
      "/deptfolders/" + user.departmentnumber + "/"
    );
    try {
      fs.unlinkSync(directoryPath + filename);

      fs.readFile(jsonfilename, "utf8", (err, data) => {
        if (err) {
          console.log(err);
          res.status(400).json({
            message: "[DELETE] Error in reading json",
          });
        } else {
          data = JSON.parse(data);
          var data2 = [];
          var flag = false;
          for (const manje of data) {
            if (manje["filename"] == filename) {
              flag = true;
            } else {
              data2.push(manje);
            }
          }
          if (flag) {
            fs.writeFile(jsonfilename, JSON.stringify(data2), (err) => {
              if (err) {
                console.log(err);
                res.status(400).json({
                  message: "[DELETE] json File update failed",
                });
              } else {
                res.status(200).json({
                  message: "[DELETE] deleted",
                });
              }
            });
          }
        }
      });
    } catch (e) {
      if (e.code === "ENOENT") {
        fs.readFile(jsonfilename, "utf8", (err, data) => {
          if (err) {
            console.log(err);
            res.status(400).json({
              message: "[DELETE] Error in reading json",
            });
          } else {
            data = JSON.parse(data);
            var data2 = [];
            var flag = false;
            for (const manje of data) {
              if (manje["filename"] == filename) {
                flag = true;
              } else {
                data2.push(manje);
              }
            }
            if (flag) {
              fs.writeFile(jsonfilename, JSON.stringify(data2), (err) => {
                if (err) {
                  console.log(err);
                  res.status(400).json({
                    message: "[DELETE] json File update failed",
                  });
                } else {
                  res.status(200).json({
                    message: "[DELETE] deleted",
                  });
                }
              });
            }
          }
        });
      } else {
        res.status(500).json({ error: e.message });
      }
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

//to download
app.post("/download", auth, async (req, res) => {
  try {
    const { filename } = req.body;
    if (filename == null || filename == undefined) {
      return res.status(400).json({
        message: "[DOWNLOAD] filename not found",
      });
    }
    const user = await User.findById(req.user);

    const directoryPath = path.join(
      __dirname,
      "/deptfolders/" + user.departmentnumber + "/" + filename
    );

    fs.readFile(directoryPath, (err, data) => {
      if (err) {
        console.log(err);
        res.status(400).json({
          message: "[DOWNLOAD] Error in read",
        });
      } else {
        res.status(200);
        res.contentType("application/pdf");
        res.setHeader("filename", filename);
        res.send(data);
      }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/fetchdfiles", auth, async (req, res) => {
  const directoryPath = path.join(__dirname, "/json/");
  let fdarray = [];
  const user = await User.findById(req.user);
  if (
    user.departmentnumber == 1 ||
    user.departmentnumber == 2 ||
    user.departmentnumber == 3
  ) {
    try {
      const files = await fs.promises.readdir(directoryPath);
      const jsonFiles = files.filter((file) => file.endsWith(".json"));

      const readFilePromises = jsonFiles.map((file) =>
        fs.promises
          .readFile(path.join(directoryPath, file), "utf8")
          .then((data) => JSON.parse(data))
          .catch((err) => {
            console.log("Failed to read file" + file, err);
            throw new Error("Failed to read djson file");
          })
      );

      fdarray = await Promise.all(readFilePromises);
      res.status(200).json(fdarray);
    } catch (error) {
      console.error("Failed to read djson", error);
      res.status(400).json({ message: "Failed to read djson" });
    }
  } else {
    res.status(500).json({ message: "Permission Denied" });
  }
});

app.post("/downloaddeptfiles", auth, async (req, res) => {
  const user = await User.findById(req.user);
  if (
    user.departmentnumber == 1 ||
    user.departmentnumber == 2 ||
    user.departmentnumber == 3
  ) {
    try {
      const { filename } = req.body;
      if (filename == null || filename == undefined) {
        return res.status(400).json({
          message: "[DOWNLOADDEPT] filename not found",
        });
      }
      let strs = "";
      for (let i = 0; i < filename.length; i++) {
        if (filename.charCodeAt(i) == 46) {
          break;
        } else if (
          (filename.charCodeAt(i) >= 65 && filename.charCodeAt(i) <= 90) ||
          (filename.charCodeAt(i) >= 97 && filename.charCodeAt(i) <= 122) ||
          filename.charCodeAt(i) == 32
        ) {
          strs = strs + filename[i];
        }
      }
      const dpt = await User.findOne({ departmentname: strs });

      const filePath = path.join(
        __dirname,
        "/deptfolders/" + dpt.departmentnumber + "/" + filename
      );
      fs.readFile(filePath, (err, data) => {
        if (err) {
          console.log("File Not Found");
          res.status(400).json({ message: "File Not Found" });
        } else {
          res.status(200);
          res.contentType("application/pdf");
          res.setHeader("filename", filename);
          res.send(data);
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to download" });
    }
  } else {
    res.status(500).json({ error: "Permission Denied" });
  }
});

app.listen(PORT, () => {
  console.log(`connected at port ${PORT}`);
});

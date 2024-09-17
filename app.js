const bodyParser = require("body-parser");
var express = require("express");
var app = express();
var session = require("express-session");
var cookieParser = require("cookie-parser");
var flash = require("connect-flash/lib/flash");
var mongoose = require("mongoose");
var fs = require("fs");
var path = require("path");
require("dotenv/config");

var edland;
var edact;
var edev;
var edtrav;
var edacc;
var edbook;
var x = '';
var logli = [];
var log = [];
log[0] = ""; //fname
log[1] = ""; //sname
log[2] = ""; //email
log[3] = ""; //pass
log[4] = ""; //username
log[5] = ""; //admin


app.use(cookieParser("NotSoSecret"));
app.use(
  session({
    secret: "secretSHHHH",
    cookie: { maxAge: 60000 },
    resave: true,
    saveUninitialized: true,
  })
);

app.listen(8888, function () {
  console.log("Server running at http://127.0.0.1:8888/");
});
app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(flash());

app.set("view engine", "ejs");

var multer = require("multer");

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now());
  },
});
var upload = multer({ storage: storage });
var imgModel = require("./model");

var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/";

mongoose.connect(
  process.env.MONGO_URL_Revs,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    console.log("connected");
  }
);

MongoClient.connect(url, function (err, db) {
  if (err) throw err;
  var dbo = db.db("SemPro");

  dbo.listCollections({ name: "Users" }).next(function (err, collinfo) {
    if (!collinfo) {
      dbo.createCollection("Users", function (err, res) {
        if (err) throw err;
        var myobj = {
          Fname: "admin",
          Sname: "admin",
          Email: "admin@admin.com",
          Pass: "admin",
          Username: "admin",
          Admin: "yes",
        };
        dbo.collection("Users").insertOne(myobj, function (errI, resI) {
          if (errI) {
            throw errI;
          }
        });
      });
    }
  });

  dbo.listCollections({ name: "travelheaders" }).next(function (err, collinfo) {
    if (!collinfo) {
      dbo.createCollection("travelheaders", function (err, res) {
        if (err) throw err;
        var obj = {
          title: "Amsterdam",
          subj: 'Amsterdam is the capital and most populous city of the Netherlands; with a population of 907,976 within the city proper, 1,558,755 in the urban area and 2,480,394 in the metropolitan area. Found within the Dutch province of North Holland, Amsterdam is colloquially referred to as the "Venice of the North", due to the large number of canals which form a UNESCO World Heritage Site.',
          headid: "1",
          mainimg: {
            data: null,
            contentType: "image/png",
          },
        };
        dbo.collection("travelheaders").insertOne(obj, function (err1, res1) {
          if (err1) throw err1;
        });
      });
    }
  });
});

app.get("/register", function (req, res) {
  const X = req.flash("user");
  const isad = log[5];
  res.render("register", { X , isad});
});

app.post("/register", function (req, res) {
  if (log[5] != ''){
    res.redirect("travelSug");
    } else{
      
  var Fname = req.body.Fname;
  var Sname = req.body.Sname;
  var email = req.body.email;
  var psw1 = req.body.psw1;
  var psw2 = req.body.psw2;
  var li = [];

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    if (psw1 == psw2) {
      var dbo = db.db("SemPro");
      dbo
        .collection("Users")
        .find({ Email: email }, { $exists: true })
        .toArray(function (errC, resC) {
          if (errC) {
            console.log("ERROR");
            throw errC;
          } else {
            if (resC.length > 0) {
              var x = "This email is taken!";
              req.flash("user", x);
              res.redirect("register");
            } else {
              var myArr = email.split("@");
              var userName = myArr[0].concat(
                Math.floor(Math.random() * 1000) + 1
              );

              dbo
                .collection("Users")
                .find({}, { $exists: true })
                .toArray(function (errU, resU) {
                  if (errU) throw errU;
                  if (resU.length > 0) {
                    for (i = 0; i < resU.length; i++) {
                      li.push(resU[i].Username);
                    }
                    while (li.includes(userName)) {
                      userName = myArr[0].concat(
                        Math.floor(Math.random() * 1000) + 1
                      );
                    }
                    var myobj = {
                      Fname: Fname,
                      Sname: Sname,
                      Email: email,
                      Pass: psw1,
                      Username: userName,
                      Admin: "no",
                    };
                    dbo
                      .collection("Users")
                      .insertOne(myobj, function (errI, resI) {
                        if (errI) {
                          throw errI;
                        } else {
                          console.log("success");
                          x =
                            "You have registered Successfully! Your username is: " +
                            userName;
                          req.flash("user", x);
                          res.redirect("register");
                        }
                      });
                  } else {
                    console.log("2");
                  }
                });
            }
          }
        });
    } else {
      var x = "Your passwords don't match!";
      req.flash("user", x);
      res.redirect("register");
    }
  });
}
});


app.get("/", function (req, res) {
  const isad = log[5];
  res.redirect("travelSug");
});
app.get("/login", function (req, res) {
  if (log[5] == ''){
  const x = req.flash("user");
  const isad = log[5];
  res.render("login", { x , isad});
  } else{
    res.redirect("travelSug");
  }
});

app.get("/logout", function (req, res) {
          log[5] = '';
           isad = log[5];
          res.redirect("travelSug");
});

app.post("/login", function (req, res) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("SemPro");
    dbo
      .collection("Users")
      .find({ Username: req.body.Uname, Pass: req.body.psw })
      .toArray(function (errC, resC) {
        if (errC) throw resC;
        if (resC.length > 0) {
          log[0] = resC[0].Fname;
          log[1] = resC[0].Sname;
          log[2] = resC[0].Email;
          log[3] = resC[0].Pass;
          log[4] = resC[0].Username;
          log[5] = resC[0].Admin;
          /* console.log(log);
          log.map(us => {
            if (us.user == "123343"){
              console.log(us.admin);
            }
          });*/
          res.redirect("travelSug");
        } else {
          var x = "Wrong credentials";
          req.flash("user", x);
          res.redirect("login");
        }
      });
  });
});

app.get("/updateUser", function (req, res) {
  if (log[5] == ''){
    var deny = "Please log in first";
      req.flash("user", deny);
      res.redirect("login");
  }else {
    const x = req.flash("user");
    const isad = log[5];
    const oldFname = log[0];
    const oldSname = log[1];
    const oldEmail = log[2];
    const oldPass = log[3];
    const oldUser = log[4];
    res.render("updateUser", {x, isad, oldFname, oldSname, oldEmail, oldPass, oldUser});
  }
});

app.post("/updateUser", function (req, res) {
  MongoClient.connect(url, function (err, db) {
    if (req.body.Fname) {
      var Fname = req.body.Fname;
    } else {
      var Fname = log[0];
    }
    if (req.body.Sname) {
      var Sname = req.body.Sname;
    } else {
      var Sname = log[1];
    }
    if (req.body.email) {
      var Email = req.body.email;
    } else {
      var Email = log[2];
    }
    if (req.body.psw1 && req.body.psw2 && req.body.psw1 == req.body.psw1) {
      var pass = req.body.psw1;
    } else if (req.body.psw1 || req.body.psw2) {
      var x = "Passwords do not match!";
      req.flash("user", x);
      res.redirect("updateUser");
    } else {
      var pass = log[3];
    }
    if (req.body.Uname) {
      var Uname = req.body.Uname;
    } else {
      var Uname = log[4];
    }
    var dbo = db.db("SemPro");
    var myquery = { Email: Email };
    var newvalues = {
      $set: {
        Fname: Fname,
        Sname: Sname,
        Email: Email,
        Pass: pass,
        Username: Uname,
      },
    };
    if (req.body.email != log[2]) {
      dbo.collection("Users").findOne(myquery, function (err1, res1) {
        if (err1) throw err1;
        if (res1 != undefined) {
          var x = "Email is taken";
          req.flash("user", x);
          res.redirect("updateUser");
        } else {
          dbo
            .collection("Users")
            .updateMany(myquery, newvalues, function (err1, res1) {
              if (err1) throw err1;
              var x = "Data updated successfully";
              req.flash("user", x);
              res.redirect("updateUser");
            });
        }
      });
    } else if (req.body.Uname!= log[4]) {
      var myquery = { Username: Uname };
      dbo.collection("Users").findOne(myquery, function (err1, res1) {
        if (err1) throw err1;
        if (res1 != undefined) {
          var x = "Username is taken";
          req.flash("user", x);
          res.redirect("updateUser");
        } else {
          var myquery = { Email: Email };
          dbo
            .collection("Users")
            .updateMany(myquery, newvalues, function (err1, res1) {
              if (err1) throw err1;
              var x = "Data updated successfully";
              req.flash("user", x);
              res.redirect("updateUser");
            });
        }
      });
    }else{
      var myquery = { Email: Email };
      dbo
        .collection("Users")
        .updateMany(myquery, newvalues, function (err1, res1) {
          if (err1) throw err1;
          db.close();

          var x = "Data updated successfully!";
          req.flash("user", x);
          res.redirect("updateUser");
        });
    }
  });
});

app.get("/rating", (req, res) => {
  if (log[5] == ''){
    console.log(2);
      var deny = "Please log in first";
        req.flash("user", deny);
        res.redirect("login");
    }else {
  imgModel.find({}, (err, items) => {
    if (err) {
      console.log(err);
      res.status(500).send("An error occurred", err);
    } else {
      const isad = log[5];
      res.render("rating", { items: items, isad });
    }
  });
  }
  });

app.post("/rating", upload.single("uimg"), (req, res, next) => {
  const crypto = require("crypto");
  var revid = crypto.randomBytes(16).toString("hex");
  var li = [];

  MongoClient.connect(url, function (err, db) {
    var dbo = db.db("SemPro");

    dbo
      .collection("revs")
      .find({}, { $exists: true })
      .toArray(function (errU, resU) {
        if (errU) throw errU;
        if (resU.length > 0) {
          for (i = 0; i < resU.length; i++) {
            li.push(resU[i].revid);
          }
          while (li.includes(revid)) {
            console.log("ex");

            revid = crypto.randomBytes(16).toString("hex");
          }
        }
        var temp = req.file;
        var today = new Date().toLocaleDateString();
        var user = log[4];
        if (typeof temp == "undefined") {
          var obj = {
            user: user,
            subj: req.body.subj,
            rate: req.body.rating,
            revid: revid,
            date: today,
            img: {
              data: null,
              contentType: "image/png",
            },
          };
        } else {
          var obj = {
            user: user,
            subj: req.body.subj,
            rate: req.body.rating,
            revid: revid,
            date: today,
            img: {
              data: fs.readFileSync(
                path.join(__dirname + "/uploads/" + req.file.filename)
              ),
              contentType: "image/png",
            },
          };
        }

        imgModel.create(obj, (err, item) => {
          if (err) {
            console.log(err);
          } else {
            var folder = "./uploads/";

            fs.readdir(folder, (err, files) => {
              if (err) throw err;

              for (const file of files) {
                fs.unlinkSync(folder + file);
              }
            });
            // item.save();
            res.redirect("/rating");
          }
        });
      });
  });
});

app.get("/NewActivity", function (req, res) {
  if (log[5] == ''){
    console.log(2);
      var deny = "Please log in first";
        req.flash("user", deny);
        res.redirect("login");
    }else if (log[5] != "yes"){
      var deny = "Only admins allowed";
        req.flash("user", deny);
        res.redirect("login");
    }else{
  const X = req.flash("admin");
  const isad = log[5];
  res.render("NewActivity", { X, isad });
    }
});

app.post("/NewActivity", upload.single("mainimg"), (req, res, next) => {
  mongoose.connect(
    process.env.MONGO_URL_Activities,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err) => {}
  );
  var imgModel = require("./model_Act");
  const crypto = require("crypto");
  var actid = crypto.randomBytes(16).toString("hex");
  var obj = {
    title: req.body.title,
    subj: req.body.subj,
    region: req.body.region,
    cat: req.body.cat,
    actid: actid,
    mainimg: {
      data: fs.readFileSync(
        path.join(__dirname + "/uploads/" + req.file.filename)
      ),
      contentType: "image/png",
    },
  };

  imgModel.create(obj, (err, item) => {
    if (err) {
      console.log(err);
    } else {
      var folder = "./uploads/";

      fs.readdir(folder, (err, files) => {
        if (err) throw err;

        for (const file of files) {
          fs.unlinkSync(folder + file);
        }
      });
      // item.save();

      var x = "Activity added successfully";
      req.flash("admin", x);
      res.redirect("NewActivity");
    }
  });
});

app.get("/activities", function (req, res) {
  if (log[5] == ''){
    console.log(2);
      var deny = "Please log in first";
        req.flash("user", deny);
        res.redirect("login");
    }else {
  mongoose.connect(
    process.env.MONGO_URL_Activities,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err) => {}
  );
  var imgModel = require("./model_Act");

  imgModel.find({}, (err, items) => {
    if (err) {
      console.log(err);
      res.status(500).send("An error occurred", err);
    } else {
      const isad = log[5];
      res.render("activities", { items: items, isad});
    }
  });
  }
});

app.get("/NewEvent", function (req, res) {
  if (log[5] == ''){
    console.log(2);
      var deny = "Please log in first";
        req.flash("user", deny);
        res.redirect("login");
    }else if (log[5] != "yes") {
      var deny = "Only admins allowed";
        req.flash("user", deny);
        res.redirect("login");
    }else {

  const X = req.flash("admin");
  const isad = log[5];
  res.render("NewEvent", { X, isad });
  }
});

app.post(
  "/NewEvent",
  upload.fields([
    { name: "mainimg", maxCount: 1 },
    { name: "loimg", maxCount: 1 },
  ]),
  (req, res, next) => {
    mongoose.connect(
      process.env.MONGO_URL,
      { useNewUrlParser: true, useUnifiedTopology: true },
      (err) => {}
    );
    const crypto = require("crypto");
    var eventid = crypto.randomBytes(16).toString("hex");
    var imgModel = require("./model_Event");

    var obj = {
      title: req.body.title,
      subj: req.body.subj,
      region: req.body.region,
      date: req.body.dte,
      time: req.body.time,
      price: req.body.price,
      eventid: eventid,
      mainimg: {
        data: fs.readFileSync(
          path.join(__dirname + "/uploads/" + req.files["mainimg"][0].filename)
        ),
        contentType: "image/png",
      },
      loimg: {
        data: fs.readFileSync(
          path.join(__dirname + "/uploads/" + req.files["loimg"][0].filename)
        ),
        contentType: "image/png",
      },
    };

    imgModel.create(obj, (err, item) => {
      if (err) {
        console.log(err);
      } else {
        var folder = "./uploads/";

        fs.readdir(folder, (err, files) => {
          if (err) throw err;

          for (const file of files) {
            fs.unlinkSync(folder + file);
          }
        });
        // item.save();

        var x = "Event added successfully";
        req.flash("admin", x);
        res.redirect("NewEvent");
      }
    });
  }
);

app.get("/events", function (req, res) {
  if (log[5] == ''){
    console.log(2);
      var deny = "Please log in first";
        req.flash("user", deny);
        res.redirect("login");
    }else {
      
  mongoose.connect(
    process.env.MONGO_URL,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err) => {}
  );
  var imgModel = require("./model_Event");

  imgModel.find({}, (err, items) => {
    if (err) {
      console.log(err);
      res.status(500).send("An error occurred", err);
    } else {
      const isad = log[5];
      res.render("events", { items: items, isad });
    }
  });
}
});
/*
app.get("/NewLandmark", function (req, res) {
  const X = req.flash("admin");
  res.render("NewLandmark", { X });
});

app.post(
  "/NewLandmark",
  upload.fields([
    { name: "mainimg", maxCount: 1 },
    { name: "loimg", maxCount: 1 },
  ]),
  (req, res, next) => {
    const crypto = require("crypto");
    var landid = crypto.randomBytes(16).toString("hex");
    var li = [];
    MongoClient.connect(url, function (err, db) {
      var dbo = db.db("SemPro");
      dbo
        .collection("landmarks")
        .find({}, { $exists: true })
        .toArray(function (errU, resU) {
          if (errU) throw errU;
          if (resU.length > 0) {
            for (i = 0; i < resU.length; i++) {
              li.push(resU[i].landid);
            }
            while (li.includes(landid)) {
              console.log("ex");

              landid = crypto.randomBytes(16).toString("hex");
            }
          }
          mongoose.connect(
            process.env.MONGO_URL,
            { useNewUrlParser: true, useUnifiedTopology: true },
            (err) => {}
          );
          var imgModel = require("./model_Landmark");

          var obj = {
            title: req.body.title,
            subj: req.body.subj,
            link: req.body.lnk,
            landid: landid,
            mainimg: {
              data: fs.readFileSync(
                path.join(
                  __dirname + "/uploads/" + req.files["mainimg"][0].filename
                )
              ),
              contentType: "image/png",
            },
            loimg: {
              data: fs.readFileSync(
                path.join(
                  __dirname + "/uploads/" + req.files["loimg"][0].filename
                )
              ),
              contentType: "image/png",
            },
          };

          imgModel.create(obj, (err, item) => {
            if (err) {
              console.log(err);
            } else {
              var folder = "./uploads/";

              fs.readdir(folder, (err, files) => {
                if (err) throw err;

                for (const file of files) {
                  fs.unlinkSync(folder + file);
                }
              });
              // item.save();

              var x = "Landmark added successfully";
              req.flash("admin", x);
              res.redirect("NewLandmark");
            }
          });
        });
    });
  }
);

app.get("/landmarks", function (req, res) {
  mongoose.connect(
    process.env.MONGO_URL,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err) => {}
  );
  var imgModel = require("./model_Landmark");

  imgModel.find({}, (err, items) => {
    if (err) {
      console.log(err);
      res.status(500).send("An error occurred", err);
    } else {
      res.render("landmarks", { items: items });
    }
  });
});

app.get("/EditLandmark", function (req, res) {
  mongoose.connect(
    process.env.MONGO_URL,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err) => {}
  );
  var imgModel = require("./model_Landmark");

  imgModel.find({}, (err, items) => {
    if (err) {
      console.log(err);
      res.status(500).send("An error occurred", err);
    } else {
      const x = req.flash("admin");
      res.render("EditLandmark", { items: items, x });
    }
  });
});

app.post("/EditLandmark", function (req, res) {
  MongoClient.connect(url, function (err, db) {
    var dbo = db.db("SemPro");

    if (typeof req.body.edit !== "undefined") {
      const test = req.body.edit.toString();
      edland = req.body.edit.toString();
      res.redirect("EditLandmarkForm");
    }

    if (typeof req.body.delete !== "undefined") {
      dbo
        .collection("landmarks")
        .deleteOne({ landid: req.body.delete }, function (err1, res1) {
          if (err1) throw err1;
          var x = "Landmark deleted successfully";

          req.flash("admin", x);
          res.redirect("EditLandmark");
        });
    }
  });
});

app.get("/EditLandmarkForm", function (req, res) {
  if (!edland) {
    var x = "Please choose an landmark to edit!";
    req.flash("admin", x);
    res.redirect("EditLandmark");
  } else {
    mongoose.connect(
      process.env.MONGO_URL,
      { useNewUrlParser: true, useUnifiedTopology: true },
      (err) => {}
    );
    var imgModel = require("./model_Landmark");

    imgModel.find({ landid: edland }, (err, items) => {
      if (err) {
        console.log(err);
        res.status(500).send("An error occurred", err);
      } else {
        const x = req.flash("admin");
        res.render("EditLandmarkForm", { items: items, x, edland });
      }
    });
  }
});

app.post(
  "/EditLandmarkForm",
  upload.fields([
    { name: "mainimg", maxCount: 1 },
    { name: "loimg", maxCount: 1 },
  ]),
  (req, res, next) => {
    if (
      typeof req.files.loimg == "undefined" &&
      typeof req.files.mainimg == "undefined"
    ) {
      var obj = {
        $set: {
          title: req.body.title,
          subj: req.body.subj,
          link: req.body.lnk,
        },
      };
    } else if (typeof req.files.loimg == "undefined") {
      var obj = {
        $set: {
          title: req.body.title,
          subj: req.body.subj,
          link: req.body.lnk,
          mainimg: {
            data: fs.readFileSync(
              path.join(__dirname + "/uploads/" + req.files.mainimg[0].filename)
            ),
            contentType: "image/png",
          },
        },
      };
    } else if (typeof req.files.loimg == "undefined") {
      var obj = {
        $set: {
          title: req.body.title,
          subj: req.body.subj,
          link: req.body.lnk,
          mainimg: {
            data: fs.readFileSync(
              path.join(__dirname + "/uploads/" + req.files.mainimg[0].filename)
            ),
            contentType: "image/png",
          },
        },
      };
    } else {
      var obj = {
        $set: {
          title: req.body.title,
          subj: req.body.subj,
          link: req.body.lnk,
          mainimg: {
            data: fs.readFileSync(
              path.join(__dirname + "/uploads/" + req.files.mainimg[0].filename)
            ),
            contentType: "image/png",
          },
          loimg: {
            data: fs.readFileSync(
              path.join(__dirname + "/uploads/" + req.files.loimg[0].filename)
            ),
            contentType: "image/png",
          },
        },
      };
    }

    MongoClient.connect(url, function (err, db) {
      var dbo = db.db("SemPro");
      const filter = { landid: edland };
      dbo.collection("landmarks").updateOne(filter, obj, function (err1, res1) {
        if (err1) throw err1;
        var folder = "./uploads/";

        fs.readdir(folder, (err, files) => {
          if (err) throw err;

          for (const file of files) {
            fs.unlinkSync(folder + file);
          }
        });
        // item.save();
        var x = "Landmark updated successfully";
        edland = "";
        req.flash("admin", x);
        res.redirect("EditLandmarkForm");
      });
    });
  }
);
*/
app.get("/EditActivity", function (req, res) {
  if (log[5] == ''){
    console.log(2);
      var deny = "Please log in first";
        req.flash("user", deny);
        res.redirect("login");
    }else if (log[5] != "yes"){
      var deny = "Only admins allowed";
        req.flash("user", deny);
        res.redirect("login");
    }else {
  mongoose.connect(
    process.env.MONGO_URL,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err) => {}
  );
  var imgModel = require("./model_Act");

  imgModel.find({}, (err, items) => {
    if (err) {
      console.log(err);
      res.status(500).send("An error occurred", err);
    } else {
      var x = req.flash("admin");
      const isad = log[5];
      res.render("EditActivity", { items: items, x, isad });
    }
  });
}
});

app.post("/EditActivity", function (req, res) {
  MongoClient.connect(url, function (err, db) {
    var dbo = db.db("SemPro");

    if (typeof req.body.edit !== "undefined") {
      const test = req.body.edit.toString();
      edact = req.body.edit.toString();
      res.redirect("EditActivityForm");
    }

    if (typeof req.body.delete !== "undefined") {
      dbo
        .collection("acts")
        .deleteOne({ actid: req.body.delete }, function (err1, res1) {
          if (err1) throw err1;
          var x = "Activity deleted successfully";

          req.flash("admin", x);
          res.redirect("EditActivity");
        });
    }
  });
});

app.get("/EditActivityForm", function (req, res) {
  if (log[5] == ''){
    console.log(2);
      var deny = "Please log in first";
        req.flash("user", deny);
        res.redirect("login");
    }else if (log[5] != "yes"){
      var deny = "Only admins allowed";
        req.flash("user", deny);
        res.redirect("login");
    }else {
  if (!edact) {
    var x = "Please choose an activity to edit!";
    req.flash("admin", x);
    const isad = log[5];
    res.redirect("EditActivity", {x, isad});
  } else {
    mongoose.connect(
      process.env.MONGO_URL,
      { useNewUrlParser: true, useUnifiedTopology: true },
      (err) => {}
    );
    var imgModel = require("./model_Act");

    imgModel.find({ actid: edact }, (err, items) => {
      if (err) {
        console.log(err);
        res.status(500).send("An error occurred", err);
      } else {
        const x = req.flash("admin");
        const isad = log[5];
        res.render("EditActivityForm", { items: items, x, edact, isad });
      }
    });
  }
}
});

app.post("/EditActivityForm", upload.single("mainimg"), (req, res, next) => {
  if (typeof req.file == "undefined") {
    if (typeof req.body.cat == "undefined") {
      var obj = {
        $set: {
          title: req.body.title,
          subj: req.body.subj,
          region: req.body.region,
        },
      };
    } else {
      var obj = {
        $set: {
          title: req.body.title,
          subj: req.body.subj,
          region: req.body.region,
          cat: req.body.cat,
        },
      };
    }
  } else {
    if (typeof req.body.cat == "undefined") {
      var obj = {
        $set: {
          title: req.body.title,
          subj: req.body.subj,
          region: req.body.region,
          mainimg: {
            data: fs.readFileSync(
              path.join(__dirname + "/uploads/" + req.file.filename)
            ),
            contentType: "image/png",
          },
        },
      };
    } else {
      var obj = {
        $set: {
          title: req.body.title,
          subj: req.body.subj,
          region: req.body.region,
          cat: req.body.cat,
          mainimg: {
            data: fs.readFileSync(
              path.join(__dirname + "/uploads/" + req.file.filename)
            ),
            contentType: "image/png",
          },
        },
      };
    }
  }

  MongoClient.connect(url, function (err, db) {
    var dbo = db.db("SemPro");
    const filter = { actid: edact };
    dbo.collection("acts").updateOne(filter, obj, function (err1, res1) {
      if (err1) throw err1;
      var folder = "./uploads/";

      fs.readdir(folder, (err, files) => {
        if (err) throw err;

        for (const file of files) {
          fs.unlinkSync(folder + file);
        }
      });
      // item.save();
      var x = "Activity updated successfully";
      edact = "";
      req.flash("admin", x);
      
      res.redirect("EditActivity");
    });
  });
});

app.get("/EditEvent", function (req, res) {
  if (log[5] == ''){
    console.log(2);
      var deny = "Please log in first";
        req.flash("user", deny);
        res.redirect("login");
    }else if (log[5] != "yes"){
      var deny = "Only admins allowed";
        req.flash("user", deny);
        res.redirect("login");
    }else {
  mongoose.connect(
    process.env.MONGO_URL,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err) => {}
  );
  var imgModel = require("./model_Event");

  imgModel.find({}, (err, items) => {
    if (err) {
      console.log(err);
      res.status(500).send("An error occurred", err);
    } else {
      const x = req.flash("admin");
      const isad = log[5];
      res.render("EditEvent", { items: items, x , isad});
    }
  });
}
});

app.post("/EditEvent", function (req, res) {
  MongoClient.connect(url, function (err, db) {
    var dbo = db.db("SemPro");
    if (typeof req.body.edit !== "undefined") {
      const test = req.body.edit.toString();
      edev = req.body.edit.toString();
      res.redirect("EditEventForm");
    }

    if (typeof req.body.delete !== "undefined") {
      dbo
        .collection("events")
        .deleteOne({ eventid: req.body.delete }, function (err1, res1) {
          if (err1) throw err1;
          var x = "Event deleted successfully";

          req.flash("admin", x);
          res.redirect("EditEvent");
        });
    }
  });
});

app.get("/EditEventForm", function (req, res) {
  if (log[5] == ''){
    console.log(2);
      var deny = "Please log in first";
        req.flash("user", deny);
        res.redirect("login");
    }else if (log[5] != "yes"){
      var deny = "Only admins allowed";
        req.flash("user", deny);
        res.redirect("login");
    }else {
  if (!edev) {
    var x = "Please choose an event to edit!";
    req.flash("admin", x);
    res.redirect("EditEvent");
  } else {
    mongoose.connect(
      process.env.MONGO_URL,
      { useNewUrlParser: true, useUnifiedTopology: true },
      (err) => {}
    );
    var imgModel = require("./model_Event");

    imgModel.find({ eventid: edev }, (err, items) => {
      if (err) {
        console.log(err);
        res.status(500).send("An error occurred", err);
      } else {
        const x = req.flash("admin");
        const isad = log[5];
        res.render("EditEventForm", { items: items, x, edev, isad });
      }
    });
  }
}
});

app.post(
  "/EditEventForm",
  upload.fields([
    { name: "mainimg", maxCount: 1 },
    { name: "loimg", maxCount: 1 },
  ]),
  (req, res, next) => {
    if (
      typeof req.files.loimg == "undefined" &&
      typeof req.files.mainimg == "undefined"
    ) {
      var obj = {
        $set: {
          title: req.body.title,
          subj: req.body.subj,
          region: req.body.region,
          date: req.body.dte,
          time: req.body.time,
          price: req.body.price,
        },
      };
    } else if (typeof req.files.loimg == "undefined") {
      var obj = {
        $set: {
          title: req.body.title,
          subj: req.body.subj,
          region: req.body.region,
          date: req.body.dte,
          time: req.body.time,
          price: req.body.price,
          mainimg: {
            data: fs.readFileSync(
              path.join(__dirname + "/uploads/" + req.files.mainimg[0].filename)
            ),
            contentType: "image/png",
          },
        },
      };
    } else if (typeof req.files.mainimg == "undefined") {
      var obj = {
        $set: {
          title: req.body.title,
          subj: req.body.subj,
          region: req.body.region,
          date: req.body.dte,
          time: req.body.time,
          price: req.body.price,
          mainimg: {
            data: fs.readFileSync(
              path.join(__dirname + "/uploads/" + req.files.mainimg[0].filename)
            ),
            contentType: "image/png",
          },
        },
      };
    } else {
      var obj = {
        $set: {
          title: req.body.title,
          subj: req.body.subj,
          region: req.body.region,
          date: req.body.dte,
          time: req.body.time,
          price: req.body.price,
          mainimg: {
            data: fs.readFileSync(
              path.join(__dirname + "/uploads/" + req.files.mainimg[0].filename)
            ),
            contentType: "image/png",
          },
          loimg: {
            data: fs.readFileSync(
              path.join(__dirname + "/uploads/" + req.files.loimg[0].filename)
            ),
            contentType: "image/png",
          },
        },
      };
    }

    MongoClient.connect(url, function (err, db) {
      var dbo = db.db("SemPro");
      const filter = { eventid: edev };
      dbo.collection("events").updateOne(filter, obj, function (err1, res1) {
        if (err1) throw err1;
        var folder = "./uploads/";

        fs.readdir(folder, (err, files) => {
          if (err) throw err;

          for (const file of files) {
            fs.unlinkSync(folder + file);
          }
        });
        // item.save();
        var x = "Event updated successfully";
        edev = "";
        req.flash("admin", x);
        res.redirect("EditEvent");
      });
    });
  }
);

app.get("/travelSug", function (req, res) {

  mongoose.connect(
    process.env.MONGO_URL,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err) => {}
  );
  var imgModel = require("./model_Travel");
  imgModel.find({}, (err, items) => {
    if (err) {
      console.log(err);
      res.status(500).send("An error occurred", err);
    } else {
      imgModel2 = require("./model_TravelHeader");
      imgModel2.find({}, (err, hed) => {
        if (err) {
          console.log(err);
          res.status(500).send("An error occurred", err);
        } else {
          var x = req.flash("admin");
          const isad = log[5];
          res.render("travelSug", { items: items, hed: hed, x , isad});
        }
      });
    }
  });

});

app.get("/NewTravelSug", function (req, res) {
  if (log[5] == ''){
    console.log(2);
      var deny = "Please log in first";
        req.flash("user", deny);
        res.redirect("login");
    }else if (log[5] != "yes"){
      var deny = "Only admins allowed";
        req.flash("user", deny);
        res.redirect("login");
    }else {
  const x = req.flash("admin");
  const isad = log[5];
  res.render("NewTravelSug", { x ,isad });
    }
});

app.post("/NewTravelSug", upload.single("mainimg"), (req, res, next) => {
  mongoose.connect(
    process.env.MONGO_URL_Activities,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err) => {}
  );
  var imgModel = require("./model_Travel");
  const crypto = require("crypto");
  var travid = crypto.randomBytes(16).toString("hex");
  var obj = {
    title: req.body.title,
    subj: req.body.subj,
    gmap: req.body.gmap,
    read: req.body.read,
    travid: travid,
    mainimg: {
      data: fs.readFileSync(
        path.join(__dirname + "/uploads/" + req.file.filename)
      ),
      contentType: "image/png",
    },
  };

  imgModel.create(obj, (err, item) => {
    if (err) {
      console.log(err);
    } else {
      var folder = "./uploads/";

      fs.readdir(folder, (err, files) => {
        if (err) throw err;

        for (const file of files) {
          fs.unlinkSync(folder + file);
        }
      });
      // item.save();

      var x = "Travel suggestion added successfully";
      req.flash("admin", x);
      res.redirect("NewTravelSug");
    }
  });
});

app.get("/EditTravelSug", function (req, res) {
  if (log[5] == ''){
    console.log(2);
      var deny = "Please log in first";
        req.flash("user", deny);
        res.redirect("login");
    }else if (log[5] != "yes"){
      var deny = "Only admins allowed";
        req.flash("user", deny);
        res.redirect("login");
    }else {
  mongoose.connect(
    process.env.MONGO_URL,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err) => {}
  );
  var imgModel = require("./model_Travel");
  imgModel.find({}, (err, items) => {
    if (err) {
      console.log(err);
      res.status(500).send("An error occurred", err);
    } else {
      var x = req.flash("admin");
      imgModel = require("./model_TravelHeader");
      imgModel.find({}, (err, hed) => {
        if (err) {
          console.log(err);
          res.status(500).send("An error occurred", err);
        } else {
          var x = req.flash("admin");
          const isad = log[5];
          res.render("EditTravelSug", { items: items, hed: hed, x , isad});
        }
      });
    }
  });
}
});

app.post("/EditTravelSug", function (req, res) {
  MongoClient.connect(url, function (err, db) {
    var dbo = db.db("SemPro");

    if (typeof req.body.edit !== "undefined") {
      if (req.body.edit == "1") {
        res.redirect("EditTravelHeadForm");
      } else {
        edtrav = req.body.edit.toString();
        res.redirect("EditTravelSugForm");
      }
    }
    if (typeof req.body.delete !== "undefined") {
      dbo
        .collection("travelsugs")
        .deleteOne({ travid: req.body.delete }, function (err1, res1) {
          if (err1) throw err1;
          var x = "Travel suggestion deleted successfully";

          req.flash("admin", x);
          res.redirect("EditTravelSug");
        });
    }
  });
});

app.get("/EditTravelHeadForm", function (req, res) {
  if (log[5] == ''){
    console.log(2);
      var deny = "Please log in first";
        req.flash("user", deny);
        res.redirect("login");
    }else if (log[5] != "yes"){
      var deny = "Only admins allowed";
        req.flash("user", deny);
        res.redirect("login");
    }else {
  mongoose.connect(
    process.env.MONGO_URL,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err) => {}
  );
  var imgModel = require("./model_TravelHeader");

  imgModel.find({ headid: "1" }, (err, items) => {
    if (err) {
      console.log(err);
      res.status(500).send("An error occurred", err);
    } else {
      const x = req.flash("admin");
      const isad = log[5];
      res.render("EditTravelHeadForm", { items: items, x, isad });
    }
  });
}
});

app.post("/EditTravelHeadForm", upload.single("mainimg"), (req, res, next) => {
  if (typeof req.file == "undefined") {
    var obj = {
      $set: {
        title: req.body.title,
        subj: req.body.subj,
        headid: "1",
      },
    };
  } else {
    var obj = {
      $set: {
        title: req.body.title,
        subj: req.body.subj,
        headid: "1",
        mainimg: {
          data: fs.readFileSync(
            path.join(__dirname + "/uploads/" + req.file.filename)
          ),
          contentType: "image/png",
        },
      },
    };
  }
  MongoClient.connect(url, function (err, db) {
    var dbo = db.db("SemPro");
    const filter = { headid: "1" };

    dbo
      .collection("travelheaders")
      .updateOne(filter, obj, function (err1, res1) {
        if (err1) throw err1;
        var folder = "./uploads/";
        fs.readdir(folder, (err, files) => {
          if (err) throw err;

          for (const file of files) {
            fs.unlinkSync(folder + file);
          }
        });
      });
    var x = "Header updated successfully";
    req.flash("admin", x);
    res.redirect("EditTravelHead");
  });
});

app.get("/EditTravelSugForm", function (req, res) {
  if (log[5] == ''){
    console.log(2);
      var deny = "Please log in first";
        req.flash("user", deny);
        res.redirect("login");
    }else if (log[5] != "yes"){
      var deny = "Only admins allowed";
        req.flash("user", deny);
        res.redirect("login");
    }else {
  if (!edtrav) {
    var x = "Please choose an travel suggestion to edit!";
    req.flash("admin", x);
    res.redirect("EditTravelSug");
  } else {
    mongoose.connect(
      process.env.MONGO_URL,
      { useNewUrlParser: true, useUnifiedTopology: true },
      (err) => {}
    );
    var imgModel = require("./model_Travel");

    imgModel.find({ travid: edtrav }, (err, items) => {
      if (err) {
        console.log(err);
        res.status(500).send("An error occurred", err);
      } else {
        const x = req.flash("admin");
        const isad = log[5];
        res.render("EditTravelSugForm", { items: items, x, edtrav, isad });
      }
    });
  }
}
});

app.post("/EditTravelSugForm", upload.single("mainimg"), (req, res, next) => {
  if (typeof req.file == "undefined") {
    var obj = {
      $set: {
        title: req.body.title,
        subj: req.body.subj,
        gmap: req.body.gmap,
        read: req.body.read,
      },
    };
  } else {
    var obj = {
      $set: {
        title: req.body.title,
        subj: req.body.subj,
        gmap: req.body.gmap,
        read: req.body.read,
        mainimg: {
          data: fs.readFileSync(
            path.join(__dirname + "/uploads/" + req.file.filename)
          ),
          contentType: "image/png",
        },
      },
    };
  }

  MongoClient.connect(url, function (err, db) {
    var dbo = db.db("SemPro");
    const filter = { travid: edtrav };
    dbo.collection("travelsugs").updateOne(filter, obj, function (err1, res1) {
      if (err1) throw err1;
      var folder = "./uploads/";

      fs.readdir(folder, (err, files) => {
        if (err) throw err;

        for (const file of files) {
          fs.unlinkSync(folder + file);
        }
      });
      // item.save();
      var x = "Travel suggestion updated successfully";
      edtrav = "";
      req.flash("admin", x);
      res.redirect("EditTravelSug");
    });
  });
});

app.get("/NewAccommodation", function (req, res) {
  if (log[5] == ''){
    console.log(2);
      var deny = "Please log in first";
        req.flash("user", deny);
        res.redirect("login");
    }else if (log[5] != "yes"){
      var deny = "Only admins allowed";
        req.flash("user", deny);
        res.redirect("login");
    }else {
  const x = req.flash("admin");
  const isad = log[5];
  res.render("NewAccommodation", { x , isad});
    }
});

app.post(
  "/NewAccommodation",
  upload.fields([
    { name: "mainimg", maxCount: 1 },
    { name: "loimg", maxCount: 1 },
  ]),
  (req, res, next) => {
    const crypto = require("crypto");
    var accid = crypto.randomBytes(16).toString("hex");
    var li = [];
    MongoClient.connect(url, function (err, db) {
      var dbo = db.db("SemPro");
      dbo
        .collection("acco")
        .find({}, { $exists: true })
        .toArray(function (errU, resU) {
          if (errU) throw errU;
          if (resU.length > 0) {
            for (i = 0; i < resU.length; i++) {
              li.push(resU[i].accid);
            }
            while (li.includes(accid)) {
              console.log("ex");

              accid = crypto.randomBytes(16).toString("hex");
            }
          }
          mongoose.connect(
            process.env.MONGO_URL,
            { useNewUrlParser: true, useUnifiedTopology: true },
            (err) => {}
          );
          var imgModel = require("./model_Acco");

          var obj = {
            title: req.body.title,
            subj: req.body.subj,
            cat: req.body.cat,
            accid: accid,
            rooms: req.body.rooms,
            ssb: req.body.ssb,
            dsb: req.body.dsb,
            guests: req.body.guests,
            price: req.body.price,
            mainimg: {
              data: fs.readFileSync(
                path.join(
                  __dirname + "/uploads/" + req.files["mainimg"][0].filename
                )
              ),
              contentType: "image/png",
            },
            loimg: {
              data: fs.readFileSync(
                path.join(
                  __dirname + "/uploads/" + req.files["loimg"][0].filename
                )
              ),
              contentType: "image/png",
            },
          };

          imgModel.create(obj, (err, item) => {
            if (err) {
              console.log(err);
            } else {
              var folder = "./uploads/";

              fs.readdir(folder, (err, files) => {
                if (err) throw err;

                for (const file of files) {
                  fs.unlinkSync(folder + file);
                }
              });
              // item.save();

              var x = "Accomodation added successfully";
              req.flash("admin", x);
              res.redirect("NewAccommodation");
            }
          });
        });
    });
  }
);

app.get("/Accommodation", function (req, res) {
  if (log[5] == ''){
    console.log(2);
      var deny = "Please log in first";
        req.flash("user", deny);
        res.redirect("login");
    }else {
  mongoose.connect(
    process.env.MONGO_URL,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err) => {}
  );
  var imgModel = require("./model_Acco");

  imgModel.find({}, (err, items) => {
    if (err) {
      console.log(err);
      res.status(500).send("An error occurred", err);
    } else {
      var x = req.flash("user");
     items.forEach(function(act) { 
     });
     const isad = log[5];
      res.render("Accommodation", { items: items, x, isad });
    }
  });
}
});

app.post("/Accommodation", function (req, res) {
  mongoose.connect(
    process.env.MONGO_URL,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err) => {}
  );
  var imgModel = require("./model_Acco");

  imgModel.find({ accid: req.body.book }, (err, items) => {
    if (err) {
      console.log(err);
      res.status(500).send("An error occurred", err);
    } else {
      edbook = req.body.book.toString();
      res.redirect("Accform");
    }
  });
});

app.get("/EditAccommodation", function (req, res) {
  if (log[5] == ''){
    console.log(2);
      var deny = "Please log in first";
        req.flash("user", deny);
        res.redirect("login");
    }else if (log[5] != "yes"){
      var deny = "Only admins allowed";
        req.flash("user", deny);
        res.redirect("login");
    }else{
  mongoose.connect(
    process.env.MONGO_URL,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err) => {}
  );
  var imgModel = require("./model_Acco");

  imgModel.find({}, (err, items) => {
    if (err) {
      console.log(err);
      res.status(500).send("An error occurred", err);
    } else {
      const x = req.flash("admin");
      const isad = log[5];
      res.render("EditAccommodation", { items: items, x , isad});
    }
  });
}
});

app.post("/EditAccommodation", function (req, res) {
  MongoClient.connect(url, function (err, db) {
    var dbo = db.db("SemPro");

    if (typeof req.body.edit !== "undefined") {
      const test = req.body.edit.toString();
      edacc = req.body.edit.toString();
      res.redirect("EditAccommodationForm");
    }

    if (typeof req.body.delete !== "undefined") {
      dbo
        .collection("accos")
        .deleteOne({ accid: req.body.delete }, function (err1, res1) {
          if (err1) throw err1;
          var x = "Accomodation deleted successfully";

          req.flash("admin", x);
          res.redirect("EditAccommodation");
        });
    }
  });
});

app.get("/EditAccommodationForm", function (req, res) {
  if (log[5] == ''){
    console.log(2);
      var deny = "Please log in first";
        req.flash("user", deny);
        res.redirect("login");
    }else if (log[5] != "yes"){
      var deny = "Only admins allowed";
        req.flash("user", deny);
        res.redirect("login");
    }else {
  if (!edacc) {
    var x = "Please choose an accommodation to edit!";
    req.flash("admin", x);
    res.redirect("EditAccommodation");
  } else {
    mongoose.connect(
      process.env.MONGO_URL,
      { useNewUrlParser: true, useUnifiedTopology: true },
      (err) => {}
    );
    var imgModel = require("./model_Acco");
    imgModel.find({ accid: edacc }, (err, items) => {
      if (err) {
        console.log(err);
        res.status(500).send("An error occurred", err);
      } else {
        const x = req.flash("admin");
        const isad = log[5];
        res.render("EditAccommodationForm", { items: items, x, edacc, isad });
      }
    });
  }}
});

app.post(
  "/EditAccommodationForm",
  upload.fields([
    { name: "mainimg", maxCount: 1 },
    { name: "loimg", maxCount: 1 },
  ]),
  (req, res, next) => {
    if (
      typeof req.files.loimg == "undefined" &&
      typeof req.files.mainimg == "undefined"
    ) {
      if (typeof req.body.cat == "undefined") {
        var obj = {
          $set: {
            title: req.body.title,
            subj: req.body.subj,
            rooms: req.body.rooms,
            ssb: req.body.ssb,
            dsb: req.body.dsb,
            guests: req.body.guests,
            price: req.body.price,
          },
        };
      } else {
        var obj = {
          $set: {
            title: req.body.title,
            subj: req.body.subj,
            cat: req.body.cat,
            rooms: req.body.rooms,
            ssb: req.body.ssb,
            dsb: req.body.dsb,
            guests: req.body.guests,
            price: req.body.price,
          },
        };
      }
    } else if (typeof req.files.loimg == "undefined") {
      if (typeof req.body.cat == "undefined") {
        var obj = {
          $set: {
            title: req.body.title,
            subj: req.body.subj,
            rooms: req.body.rooms,
            ssb: req.body.ssb,
            dsb: req.body.dsb,
            guests: req.body.guests,
            price: req.body.price,
            mainimg: {
              data: fs.readFileSync(
                path.join(
                  __dirname + "/uploads/" + req.files.mainimg[0].filename
                )
              ),
              contentType: "image/png",
            },
          },
        };
      } else {
        var obj = {
          $set: {
            title: req.body.title,
            subj: req.body.subj,
            cat: req.body.cat,
            rooms: req.body.rooms,
            ssb: req.body.ssb,
            dsb: req.body.dsb,
            guests: req.body.guests,
            price: req.body.price,
            mainimg: {
              data: fs.readFileSync(
                path.join(
                  __dirname + "/uploads/" + req.files.mainimg[0].filename
                )
              ),
              contentType: "image/png",
            },
          },
        };
      }
    } else if (typeof req.files.mainimg == "undefined") {
      if (typeof req.body.cat == "undefined") {
        var obj = {
          $set: {
            title: req.body.title,
            subj: req.body.subj,
            rooms: req.body.rooms,
            ssb: req.body.ssb,
            dsb: req.body.dsb,
            guests: req.body.guests,
            price: req.body.price,
            loimg: {
              data: fs.readFileSync(
                path.join(__dirname + "/uploads/" + req.files.loimg[0].filename)
              ),
              contentType: "image/png",
            },
          },
        };
      } else {
        var obj = {
          $set: {
            title: req.body.title,
            subj: req.body.subj,
            cat: req.body.cat,
            rooms: req.body.rooms,
            ssb: req.body.ssb,
            dsb: req.body.dsb,
            guests: req.body.guests,
            price: req.body.price,
            loimg: {
              data: fs.readFileSync(
                path.join(__dirname + "/uploads/" + req.files.loimg[0].filename)
              ),
              contentType: "image/png",
            },
          },
        };
      }
    } else {
      if (typeof req.body.cat == "undefined") {
        var obj = {
          $set: {
            title: req.body.title,
            subj: req.body.subj,
            rooms: req.body.rooms,
            ssb: req.body.ssb,
            dsb: req.body.dsb,
            guests: req.body.guests,
            price: req.body.price,
            mainimg: {
              data: fs.readFileSync(
                path.join(
                  __dirname + "/uploads/" + req.files.mainimg[0].filename
                )
              ),
              contentType: "image/png",
            },
            loimg: {
              data: fs.readFileSync(
                path.join(__dirname + "/uploads/" + req.files.loimg[0].filename)
              ),
              contentType: "image/png",
            },
          },
        };
      } else {
        var obj = {
          $set: {
            title: req.body.title,
            subj: req.body.subj,
            cat: req.body.cat,
            rooms: req.body.rooms,
            ssb: req.body.ssb,
            dsb: req.body.dsb,
            guests: req.body.guests,
            price: req.body.price,
            mainimg: {
              data: fs.readFileSync(
                path.join(
                  __dirname + "/uploads/" + req.files.mainimg[0].filename
                )
              ),
              contentType: "image/png",
            },
            loimg: {
              data: fs.readFileSync(
                path.join(__dirname + "/uploads/" + req.files.loimg[0].filename)
              ),
              contentType: "image/png",
            },
          },
        };
      }
    }

    MongoClient.connect(url, function (err, db) {
      var dbo = db.db("SemPro");
      const filter = { accid: edacc };
      dbo.collection("accos").updateOne(filter, obj, function (err1, res1) {
        if (err1) throw err1;
        var folder = "./uploads/";

        fs.readdir(folder, (err, files) => {
          if (err) throw err;

          for (const file of files) {
            fs.unlinkSync(folder + file);
          }
        });
        // item.save();
        var x = "Accommodation updated successfully";
        edacc = "";
        req.flash("admin", x);
        res.redirect("EditAccommodation");
      });
    });
  }
);


app.get("/Accform", function (req, res) {
  if (log[5] == ''){
    console.log(2);
      var deny = "Please log in first";
        req.flash("user", deny);
        res.redirect("login");
    }else {
  if (!edbook) {
    var x = "Please choose an accommodation to book!";
    req.flash("admin", x);
    res.redirect("Accommodation");
  } else {
    mongoose.connect(
      process.env.MONGO_URL,
      { useNewUrlParser: true, useUnifiedTopology: true },
      (err) => {}
    );
    var imgModel = require("./model_Acco");

    imgModel.find({ accid: edbook }, (err, items) => {
      if (err) {
        console.log(err);
        res.status(500).send("An error occurred", err);
      } else {
        var x = req.flash("user");
        const isad = log[5];
        res.render("Accform", { items: items, x, isad });
      }
    });
  }}
});

app.post("/Accform", function (req, res) {
  
  const obj = JSON.parse(JSON.stringify(req.body));
  console.log(JSON.parse(JSON.stringify(req.body)));
    //console.log(obj['data[]'][0])
  //console.log(obj['data[]'].length);
        /*mongoose.connect(
          process.env.MONGO_URL,
          { useNewUrlParser: true, useUnifiedTopology: true },
          (err) => {}
        );
        var imgModel = require("./model_Accform");

        var obj = {
          book: objstr,
        };

        imgModel.create(obj, (err, item) => {
          if (err) {
            console.log(err);
          } else {
            var x = "Booking added successfully";
            req.flash("user", x);
            res.redirect("Accommodation");
          }
        });*/
            var x = "Booking added successfully";
            req.flash("user", x);
            res.redirect("Accommodation");
});

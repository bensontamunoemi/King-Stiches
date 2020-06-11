const dotenv = require("dotenv");
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const flash = require("connect-flash");
const multer  = require("multer");
const Contact = require ("./modules/contact");
const Product = require ("./modules/product");
const path = require("path");


// const gridfsStorage = require("multer-gridfs-storage");
// const grid = require("gridfs-stream");
// const methodOverride = require("method-override");
// const crypto = require("crypto");




const app = express();



app.set("view engine", "ejs");
app.use(express.static("public"));
// app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
  secret: "Thisisourlittleprettysecreat",
  resave: false,
  cookie: { maxAge: 60000 },
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());





const adminSchema = new mongoose.Schema({
  email: String,
  password: String
});

adminSchema.plugin(passportLocalMongoose);

const Admin = new mongoose.model("Admin", adminSchema);

passport.use(Admin.createStrategy());

passport.serializeUser(Admin.serializeUser());
passport.deserializeUser(Admin.deserializeUser());

app.get("/", function(req,res){
  // Product.find({}).sort({_id:-1}).limit( 8 ).exec(function(err, foundProduct){
  //     if(err){
  //       console.log(err);
  //     }else{
  //       if(foundProduct){
  //         res.render("index", {clothProducts: foundProduct, success: req.flash("info")});
  //       }
  //     }
  //   });

  const options = {
  page: parseInt(req.query.page) || 1,
  limit: 12,
  sort: { _id: -1 },
  collation: {
    locale: 'en'
  }
};

Product.paginate({}, options, function(err, result) {

  if(err){
    console.log(err);
  }else{
    if(result){
      res.render("index", {clothProducts: result,  success: req.flash("info")});
    }
  }
  // result.docs
  // result.totalDocs = 100
  // result.limit = 10
  // result.page = 1
  // result.totalPages = 10
  // result.hasNextPage = true
  // result.nextPage = 2
  // result.hasPrevPage = false
  // result.prevPage = null
  // result.pagingCounter = 1

});

});

app.post("/", function(req,res){

  let today = new Date();
  let dd = String(today.getDate()).padStart(2, '0');
  let mm = String(today.getMonth() + 1).padStart(2, '0');
  let yyyy = today.getFullYear();

  today = mm + '/' + dd + '/' + yyyy;

  const message = new Contact({
    name: req.body.yourName,
    email: req.body.yourEmail,
    phone: req.body.yourPhone,
    message: req.body.yourMessage,
    date: today
  });

message.save(function(err){
    if (err){
      console.log(err);
    }else{
      console.log("Your data has been saved!");
      req.flash("info", "Thank you!, we will get back to you soonest 👍🏼");
      res.redirect("/");
    }
  });
});

app.get("/admin", function(req,res){
  // if (req.isAuthenticated()){
  //   res.render("admin");
  // } else {
  //   res.redirect("/login");
  // }

  Contact.find().sort({_id: -1}).exec(function(err, foundMessage){
    if (err){
      console.log(err);
    } else {
      if (foundMessage) {
        res.render("admin", {sentMessage: foundMessage, success: req.flash("info"), warning: req.flash("bad")});
      }
    }
  });


});

app.post("/upload", function (req, res, next) {

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/uploads");
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now()+path.extname(file.originalname));
    }
  });

  const upload = multer({ storage: storage,
    fileFilter: function (req, file, callback) {
            var ext = path.extname(file.originalname);
            if(ext !== ".png" && ext !== ".jpg" && ext !== ".gif" && ext !== ".jpeg") {
                req.fileValidationError = "Only Images are allowed to be uploaded";
                  // res.send("Only Images are allowed to be uploaded");
                  return callback(new Error('Only images are allowed'));
            }
            callback(null, true)
        },
        limits:{
            fileSize: 5000 * 5000
        }
   }).single("productImage");


    upload(req, res, (err) => {
      if(req.fileValidationError) {
              return res.end(req.fileValidationError);
        }else{
        const newProduct = new Product({
          title: req.body.productName,
          description: req.body.productDes,
          imagename: req.file.filename
        });
       newProduct.save(function(err){
         if(err){
           console.log(err);
         }else{
           console.log("saved Successfully");
           req.flash("info", "Product has uploaded Successfully ✌️");
           res.redirect("/admin");
         }
       });
      }
    });
});

app.get("/products", function(req,res){
  res.render("product");
});
app.get("/login", function(req,res){
  res.render("login");
});

app.post("/login", function(req,res){

  const admin = new Admin({
    username: req.body.username,
    password: req.body.password
  });
  req.login(admin, function(err){
    if(err){
      console.log(err);
    }else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("admin");
      });
    }
  });
});

app.get("/register", function(req,res){
  res.render("register");
});


app.post("/register", function(req,res){

  Admin.register({username: req.body.username}, req.body.password, function(err, admin){
    if(err){
      console.log(err);
    }else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/admin");
      });
    }
  });
});



app.listen(3000, function(){
  console.log("Your server is running on port 3000");
});

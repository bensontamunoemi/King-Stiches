const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/kingDB", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);

const productSchema = new mongoose.Schema ({
  title: String,
  description: String,
  imagename: String
});


const Product = new mongoose.model("Product", productSchema);

module.exports=Product;

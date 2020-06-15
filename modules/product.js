const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

mongoose.connect(
  "mongodb+srv://admin-massive:WARIiloye@cluster0-ejn9h.mongodb.net/kingDB",
  { useNewUrlParser: true, useUnifiedTopology: true }
);
mongoose.set("useCreateIndex", true);

const productSchema = new mongoose.Schema({
  title: String,
  description: String,
  imagename: String,
});
productSchema.plugin(mongoosePaginate);

const Product = new mongoose.model("Product", productSchema);
Product.paginate().then({});

module.exports = Product;

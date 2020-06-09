const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/kingDB", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);

const contactSchema = new mongoose.Schema ({
  name: String,
  email: String,
  phone: String,
  message: String,
  date: String
});


const Contact = new mongoose.model("Contact", contactSchema);

module.exports = Contact;

//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", {
  useNewUrlParser: true,
});

const itemsSchema = {
  name: String,
};

const itemModel = mongoose.model("item", itemsSchema);

const item1 = new itemModel({
  name: "Learn React",
});

const item2 = new itemModel({
  name: "Learn Angular",
});

const item3 = new itemModel({
  name: "Learn Advanced Node",
});

const defaultItems = [item1, item2, item3];

app.get("/", function (req, res) {
  itemModel.find({}, (err, dbItems) => {
    if (err) {
      console.log(err);
    } else {
      if (dbItems.length === 0) {
        itemModel.insertMany(defaultItems, (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log("Database updated succesfully!");
          }
        });
        res.redirect("/");
      } else {
        res.render("list", { listTitle: "To-Do App", newListItems: dbItems });
      }
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const item = new itemModel({
    name: itemName,
  });
  item.save();
  res.redirect("/");
});

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});

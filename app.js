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

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const ListModel = mongoose.model("List", listSchema);

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
  const listName = req.body.list;

  const item = new itemModel({
    name: itemName,
  });

  if (listName === "To-Do App") {
    item.save();
    res.redirect("/");
  } else {
    ListModel.findOne({ name: listName }, (err, foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "To-Do App") {
    itemModel.findByIdAndRemove(checkedItemId, (err) => {
      if (!err) {
        console.log("Item Deleted");
        res.redirect("/");
      }
    });
  } else {
    ListModel.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } },
      (err, foundList) => {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

app.get("/:customListName", (req, res) => {
  customListName = req.params.customListName;

  ListModel.findOne({ name: customListName }, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        //create a new list
        const list = new ListModel({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        //Show an existing list
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    }
  });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});

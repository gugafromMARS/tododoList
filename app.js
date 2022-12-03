const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
    extended: true
}));

mongoose.connect("mongodb+srv://gugaloko:3006@cluster0.vbilcjv.mongodb.net/todolistDB");

const itemsSchema = new mongoose.Schema({
    name: String
})

const Item = mongoose.model("Item", itemsSchema)

const item1 = new Item({
    name: "Welcome to your todolist!"
});

const item2 = new Item({
    name: "Hit the + button to add a new item."
});

const item3 = new Item({
    name: "<-- Checkbox for delete item!"
});

const defaultItems = [item1, item2, item3]

const listScema = new mongoose.Schema ({
    name: String,
    items: [itemsSchema]
});

const List = mongoose.model("List", listScema);

app.get("/", function (req, res) {

    Item.find({}, function (err, foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Succesfully added default items to DB!")
                }
            });  
            res.redirect("/");
        } else {
            res.render("list", {listTitle: "Today", newListItem: foundItems})
        }
    });



});

app.post("/", function (req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item ({
        name: itemName
    });

    if(listName === "Today") {
        item.save();
        res.redirect("/")
    } else {
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
    }
});


app.post("/delete", function(req, res) {
        const checkedItemID = req.body.checkbox;
        const listName = req.body.listName;

        if(listName === "Today") {
            Item.findByIdAndRemove(checkedItemID, function(err){
                if(!err){
                    console.log("Succesfully removed the item!");
                    res.redirect("/");
                } 
            });
        } else {
            List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemID}}}, function(err, foundList){
                if(!err){
                    res.redirect("/" + listName);
                }
            })
        }
});


app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName);

        List.findOne({name: customListName}, function(err, foundList) {
                if(!err) {
                    if(!foundList) {
                        //create a list because we dont have one with that name
                        const list = new List ({
                            name: customListName,
                            items: defaultItems
                        }); 
                        list.save();
                        res.redirect("/" + customListName);
                    } else {
                        // show an existing list 
                        res.render("list", {listTitle: foundList.name, newListItem: foundList.items});
                    }
                }
        });
    });

app.get("/about", function (req, res) {
    res.render("about");
})

app.post("/work", function (req, res) {
    let item = req.body.newItem;

    workItems.push(item);

    res.redirect("/work")
})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
    console.log("SERVER IS RUNING ON PORT 3000!")
});
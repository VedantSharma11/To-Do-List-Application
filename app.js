//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set('strictQuery', true);
mongoose.connect("mongodb+srv://admin-vedant:Vedantsyk9@cluster0.pjgeag2.mongodb.net/todolistDB",{useNewUrlParser:true});
//mongoose.connect("mongodb://127.0.0.1/todolistDB",{useNewUrlParser:true});

const itemSchema= new mongoose.Schema({
     name:String
});

const Item= mongoose.model("Item",itemSchema);

const item1= new Item({
    name:"Welcome to your ToDoList!!"
});
const item2= new Item({
  name:"Press +to add a new item"
});
const item3= new Item({
  name:"<-- Press to delete an item"
});

const defaultitemArr=[item1,item2,item3];

const listSchema= new mongoose.Schema({
  name:String,
  items:[itemSchema]
})

const List= mongoose.model("list",listSchema);

app.get("/", function(req, res) {

  Item.find({},function(err,result){

      if(result.length===0){
        Item.insertMany(defaultitemArr,function(err){
          if(err){
            console.log(err);
          }else{
            console.log("Succesfully added all items");
          }
        });
        res.redirect("/");     
      }else{
        res.render("list", {listTitle: "Today", newListItems: result});  
      }

  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  
  const item= new Item({
    name: itemName
  });
  
  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }

});

app.post("/delete",function(req,res){
    const newid=req.body.cheekbox;
    const listName= req.body.listName;

    if(listName==="Today"){
      Item.deleteOne({_id:newid},function(err){
        if(!err){
          console.log("deleted succesfully")
        }
      });
      res.redirect("/");
    }else{
       List.findOneAndUpdate({name:listName},{$pull:{items:{_id:newid}}},function(err, foundList){
          if(!err){
            res.redirect("/"+ listName);
          }
       });
    }
  
});

app.get("/:customList",function(req,res){
   const CLname = _.capitalize(req.params.customList);

   List.findOne({name:CLname},function(err,foundList){
      if(!err){
        if(!foundList){
          const list= new List({
            name:CLname,
            items:defaultitemArr
           });
           list.save();
           res.redirect("/"+CLname);
        }else{
          res.render("list", {listTitle: foundList.name, newListItems:foundList.items});
        }
      }
   });

});


app.listen(process.env.port || 3000, function() {
  console.log("Server started on port 3000");
});

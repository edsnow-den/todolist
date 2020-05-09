//jshint esversion:6

const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');

const app = express();

const port = 3000;
// DATABASES
const mongodbUrl = 'mongodb+srv://admin-edsnow:m@ss4617MA@cluster0-dhmls.mongodb.net/todolistDB'


app.use(bodyParser.urlencoded({
  extended: true
}));
app.set('view engine', 'ejs');
app.use(express.static(`${__dirname}/public`));


mongoose.connect(mongodbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
  }
});

const Item = mongoose.model('Item', itemsSchema);


const item1 = new Item({
  name: "Welcome to our todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a  new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];


const listSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  items: [itemsSchema]

});

const List = mongoose.model('List', listSchema);






app.get('/', (req, res) => {

  Item.find({}, (err, foundItems) => {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log('successfully added default items to todolistDB!');
        }
      });
      res.redirect('/')
    } else {
      res.render('list', {
        NewItem: foundItems,
        listTitle: "Today"
      });
    }



  });


});

app.post('/', (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  item = new Item({
    name: itemName
  });
  if (listName === "Today") {
    item.save();
    res.redirect('/');
  } else {
    List.findOne({
      name: listName
    }, (err, foundList) => {
      if (!err) {
        foundList.items.push(item);
        foundList.save();
        res.redirect(`/${listName}`);
      }
    });
  }
});

app.post('/delete', (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today") {
    Item.findByIdAndRemove({
      _id: checkedItemId
    }, (err) => {
      if (!err) {
        console.log('Successfully deleted!');
        res.redirect('/');
      } else {
        console.log(err);
      }
    });
  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: checkedItemId
        }
      }
    }, (err, foundList) => {
      if (!err) {
        res.redirect(`/${listName}`);
      }
    });
  }

});


app.get('/:customListname', (req, res) => {
  const customListname = _.upperFirst(req.params.customListname);
  List.findOne({
    name: customListname
  }, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        //Create new list
        const list = new List({
          name: customListname,
          items: defaultItems
        });
        list.save();
        res.redirect(`/${customListname}`)
      } else {
        res.render('list', {
          listTitle: foundList.name,
          NewItem: foundList.items
        })
      }
    }
  });

});


app.get('/about', (req, res) => {
  res.render('about')
});


app.listen(port, () => {
  console.log(`App running on http://localhost:${port}`);

})
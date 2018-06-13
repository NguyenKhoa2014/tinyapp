 
// load the things we need
var express = require('express');
var app = express();
var PORT = 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
 };
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  for(var item in templateVars){
    //console.log('test',item, templateVars[item]);
    for(var item1 in templateVars[item]){
      console.log(templateVars[item][item1])
    }
  }
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.post("/urls", (req, res) => {
  //console.log(req.body);  // debug statement to see POST parameters
  var shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body['longURL']; //get the URL out from the body of the request
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { 
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id] 
  };
  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
   
  res.render("./pages/index");
}); 

app.get("/u/:shortURL", (req, res) => {
  // let longURL = ...
  console.log(req.params.shortURL);
  var longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
   
  console.log(req.params.id);
  var deleteURL = req.params.id;
  delete urlDatabase[deleteURL];
  console.log(urlDatabase);
  res.redirect("/urls"); //redirect 
})

app.get("/urls/:id/put", (req, res) => {
   
  let templateVars = { 
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id] 
  };
  res.render("urls_show", templateVars);

})

app.post("/urls/:id/put", (req, res)=> {
  console.log("in post");
  console.log(req.params);
})

function generateRandomString() {
  var guid = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    guid += possible.charAt(Math.floor(Math.random() * possible.length));

  return guid;
}

 


app.listen(8080);
console.log('8080 is the magic port');
 
// load the things we need
var express = require('express');
var app = express();
var PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
 };
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
} 
app.get("/urls", (req, res) => {
  console.log(req.cookies["username"]);
  let templateVars = { 
    urls: urlDatabase,
    username: req.cookies['username'],
    users: users
   };
  for(var item in templateVars){
    //console.log('test',item, templateVars[item]);
    for(var item1 in templateVars[item]){
      console.log(templateVars[item][item1])
    }
  }
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
   
  let templateVars = { 
    urls: urlDatabase,
    username: req.cookies['username']
   };
  res.render("urls_new", templateVars);
});
app.post("/urls/new", (req, res) => {
  //console.log(req.body);  // debug statement to see POST parameters
  var shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body['longURL']; //get the URL out from the body of the request 
  res.redirect('/urls')
});

app.get("/urls/:id", (req, res) => {
  //const usernameCookie = getUserName();
  let templateVars = { 
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies['username']
  };
   
  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
  let templateVars = { 
    urls: urlDatabase,
    username: req.cookies['username']
   }; 
  res.render("./pages/index", templateVars);
}); 

app.get("/u/:shortURL", (req, res) => {
  // let longURL = ...
  console.log(req.params.shortURL);
  var longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
   
  //console.log(req.params.id);
  var deleteURL = req.params.id;
  delete urlDatabase[deleteURL];
  //console.log(urlDatabase);
  res.redirect("/urls"); //redirect 
})

app.get("/urls/:id/put", (req, res) => {
   
  let templateVars = { 
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies['username'], 
  };
  res.render("urls_show", templateVars);

})

app.post("/urls/:id/put", (req, res)=> {
  //console.log("in post");
  //console.log(req.body.longURL);
  //console.log(req.body['longURL']);
  //console.log(req.params.id);
  urlDatabase[req.params.id] = req.body.longURL;
  //console.log(urlDatabase);
  res.redirect('/urls');
})

app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('urls');
})

app.post('/logout', (req, res) => {
  if(req.cookies['username']){
    res.clearCookie('username');
  }
  res.redirect('urls'); 
})

app.get("/register", (req, res) => {
  let templateVars = { 
    urls: urlDatabase,
    username: req.cookies['username'],
    error: false,
    message: false,
    emailError: false
   };
  console.log('get for register');
  res.render('register', templateVars);
})

function validateData(data) {
  console.log(data.email);
  if (data.email && data.email.length > 0 && data.password && data.password.length > 0) {
    return true;
  }
  return false;
}
function checkExistingEmail(email){
  for(let key in users){
    if(users[key].email === email){
      return true;
    }
  }
  return false;
}
app.post("/register", (req, res) => {
  console.log('post for register');
  const id = generateUserID();
  //console.log(req.body);
 
  const valid = validateData(req.body);
  console.log(valid);
  if (valid){
    const id_str = id.toString();
    const email = req.body.email;
    const existing = checkExistingEmail(email);
    if (!existing){
      const password = req.body.password;
      const user = {
        id: id_str,
        email: email,
        password: password
      }
      users[id] = user;
      res.cookie('user_id', id_str);
      res.redirect('urls');
      res.status(200);
    } else {
      let templateVars = { 
        urls: urlDatabase,
        username: req.cookies['username'],
        error: true,
        message: false,
        email: req.body.email,
        password: req.body.password,
        emailError: 'email exists in our database'
       };
       res.render('register', templateVars); 
    }
 
  } else {
    let templateVars = { 
      urls: urlDatabase,
      username: req.cookies['username'],
      error: true,
      message: 'all fields are required',
      email: req.body.email,
      password: req.body.password
     };
     res.status(400);
     //res.send('all fields are required');
     res.render('register', templateVars); 
  }
   
})


function generateRandomString() {
  var guid = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    guid += possible.charAt(Math.floor(Math.random() * possible.length));

  return guid;
}

function generateUserID(){
  const userCount = Object.keys(users).length + 1;
  const prefix = 'user';
  const postfix = 'RandomID';
  const userID = `${prefix}${userCount}${postfix}`;
  return userID;
} 
 
 

app.listen(8080);
console.log('8080 is the magic port');
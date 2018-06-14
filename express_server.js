 
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
function findUserById(id){
  for(let key in users){
    let user = users[key];
    if ( user.id === id){
      return true;
    }
    return false;
  }
}

app.get("/urls", (req, res) => {
  var id = req.cookies['user_id'];
  var foundUser = findUserById(id);
  var user = {
    id: "", 
     
  };
 
  if (foundUser){
    user['id'] = id;
    console.log(user);
    let templateVars = { 
      urls: urlDatabase,
      users: users,
      user: user
     };
     rer.render('urls_index', templateVars);
  } else {
    let templateVars = { 
      urls: urlDatabase,
      users: users,
      user: user
     };
    res.render('urls_index', templateVars);
  }  

});

app.get("/urls/new", (req, res) => {
  id = req.cookies['user_id'];
  const user = {
    id: id
  } 
  let templateVars = { 
    urls: urlDatabase,
    // username: req.cookies['username'],
    user: user
   };
   console.log(templateVars);
  res.render("urls_new", templateVars);
});
app.post("/urls/new", (req, res) => {
   
  var shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body['longURL']; //get the URL out from the body of the request 
  res.redirect('/urls')
});

app.get("/urls/:id", (req, res) => {
  const id = req.cookies.user_id;
  const user = users[id];
  let templateVars = { 
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    user
  };
   
  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
  var id = req.cookies['user_id'];
  var user = {
    id: id
  }
  let templateVars = { 
    urls: urlDatabase,
    user: user,
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
  const id = req.cookies.user_id; 
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

 
app.get('/login', (req, res) => {
  
  res.render('login');
})

function validateLogin(data){
  let email = data.email;
  let password = data.password;
  const isValidLogin = true;
  for(let key in users){
    let user = users[key];
    if (user.email === email && user.password === password) {
      return true;
    }
  }
  return false;
}

app.post('/login', (req, res) => {
  // res.cookie('username', req.body.username);
  const email = req.body.email;
  const password = req.body.password;
  const data = {
    email: email,
    password: password
  }
  const validUser = validateLogin(data);
  console.log('valid user ', validUser);
  let templateVars = { 
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  if (validUser){
    res.redirect('urls');
  } else {
    res.status(403);
    console.log(res.status);
    res.render('login' );
  }
   
})

app.get('/logout', (req, res) => {
  const user = {};
  let templateVars = { 
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: user
  };
  res.render('logout',templateVars);
})

app.post('/logout', (req, res) => {
  if(req.cookies['user_id']){
    res.clearCookie('user_id');
  }
  res.redirect('login'); 
})

app.get("/register", (req, res) => {
  const user = {};
  let templateVars = { 
    urls: urlDatabase,
    username: req.cookies['username'],
    user_id: false,
    email: false,
    error: false,
    message: false,
    emailError: false,
    user: user
   };
  console.log('get for register', req.cookies['user_id']);
  if(!req.cookies['user_id']){
    res.render('register', templateVars);
  } 
   
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
  let user = {};
  const valid = validateData(req.body);
  console.log(valid);
  if (valid){
    const id_str = id.toString();
    const email = req.body.email;
    const existing = checkExistingEmail(email);
    if (!existing){
      const password = req.body.password;
      user = {
        id: id_str,
        email: email,
        password: password
      }
      users[id] = user;
      res.cookie('user_id', id_str);
      res.redirect('urls');
       
    } else {
      const user = { id :req.cookie['user_id']}
      let templateVars = { 
        urls: urlDatabase,
        username: req.cookies['username'],
        error: true,
        message: false,
        email: req.body.email,
        password: req.body.password,
        emailError: 'email exists in our database',
        user: user
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
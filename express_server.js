 
// load the things we need
const bcrypt = require('bcrypt');
var cookieSession = require('cookie-session');
var express = require('express');
var app = express();
var PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))

app.set("view engine", "ejs");

 var urlDatabase1 = {
  "b2xVn2": {url:"http://www.lighthouselabs.ca", user_id:"userRandomID"},
  "9sm5xK": {url:"http://www.google.com", user_id:"user2RandomID"},
  "6sm5xL": {url:"http://www.cnn.com", user_id:"user2RandomID"},  
 };
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "test",
    hashedPassword: bcrypt.hashSync("test", 10)
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "test",
    hashedPassword: bcrypt.hashSync("test", 10)
  }
}

 
function findUserById(id){
  var flag = false;
  for(let key in users){
    let user = users[key];
    if (user.id === id){
      flag = true;
    }
  }
  return flag;
}
function urlsForUser(id){
  const urls = {}
  for(let item in urlDatabase1){
     
    if (urlDatabase1[item].user_id === id){
       
      urls[item] = urlDatabase1[item].url;
       
    }
  }
   
  return urls;
}

function getEmailById(id){
  let user = {};
  for(let item in users){
    if (users[item].id === id){
      return users[item];
    }
  }
  return user;
}
app.get("/urls", (req, res) => {
   
  let id = req.session.user_id;
   
  var foundUser = findUserById(id);
  if (foundUser){
    let user = getEmailById(id);
     
    var urls = urlsForUser(id);
    
    let templateVars = { 
      urls: urls,
      users: users,
      user: user
     };

     res.render('urls_index', templateVars);
  } else {
    user = {};
    let templateVars = { 
      urls: urlDatabase1,
      users: users,
      user: user
     };      
    res.render('urls_index', templateVars);
  }  

});

function ensureLoggedIn(req, res, next){
  const userId = req.session.user_id;
  if (userId){
    res.locals.user = users[userId];
    res.locals.urls = urlDatabase1;
    return next();
  } else {
    return res.redirect('/login')
  }
}


  app.get("/urls/new", ensureLoggedIn, (req, res) => {
   
  id = req.session.user_id;
  let user = getEmailById(id);
  let templateVars = { 
    urls: urlDatabase1,
    user: user
   };
    
  res.render("urls_new", templateVars);
});
app.post("/urls/new", (req, res) => {
   
  var shortURL = generateRandomString();
   
  urlDatabase1[shortURL] = {
    url: req.body['longURL'],
    user_id: req.session.user_id
  }
   
  res.redirect('/urls')
});

app.get("/urls/:id", (req, res) => {
  const id = req.cookies.user_id;
  const user = users[id];
  let templateVars = { 
    shortURL: req.params.id,
    longURL: urlDatabase1[req.params.id],
    user
  };
   
  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
   
   
  var id = req.session.user_id;
   
  let user = getEmailById(id);
  let templateVars = { 
    urls: urlDatabase1,
    user: user,
   }; 
  res.render("./pages/index", templateVars);
}); 

app.get("/u/:shortURL", (req, res) => {
  shortURL = req.params.id;
  var id = req.session.user_id;
   
  let user = getEmailById(id);
  let templateVars = { 
    urls: urlDatabase1,
    user: user,
    shortURL: req.params.id,
    longURL: urlDatabase1[req.params.shortURL].url
   };
   res.redirect(urlDatabase1[req.params.shortURL].url) 
  //res.render("urls_show", templateVars);
   
});

app.post("/urls/:id/delete", (req, res) => {
   
  var deleteURL = req.params.id;
  delete urlDatabase1[deleteURL];
  
  res.redirect("/urls"); //redirect 
})

app.get("/urls/:id/put", (req, res) => {
  
  const id = req.params.id; //short URL
  const user_id = req.session.user_id;
  longURL = urlDatabase1[id].url;
  
  const user = getEmailById(user_id);
   
  urlDatabase1[id] = {
    url : longURL,
    user_id : req.session.user_id
  }
   
  let templateVars = { 
    shortURL: req.params.id,
    longURL: longURL,
    user : user
  }; 
 
  res.render("urls_show", templateVars);

})

app.post("/urls/:id/put", (req, res)=> {
  const id = req.params.id; //short URL
  const user_id = req.session.user_id;
  longURL = req.body.longURL;
   
  urlDatabase1[id] = {
    url : longURL,
    user_id : req.session.user_id
  }
   
  res.redirect('/urls');
})

 
app.get('/login', (req, res) => {
  
  res.render('login');
})

 
function validateLogin(data){
  let email = data.email;
  let password = data.password;
  for(let key in users){
  if (users[key].email === email && bcrypt.compareSync(password, users[key].hashedPassword) ) {
      return users[key];
    }
  }
  return false;
}


app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
   
  const data = {
    email: email,
    password: password
  }
  const validUser = validateLogin(data);

  if (validUser){
     
    //set cookie -- 
  
    req.session.user_id = validUser.id;
     
      
    res.redirect('/urls');
  } else {
    res.status(403);
     
    res.render('login' );
  }
   
})

app.get('/logout', (req, res) => {
  const user = {};
  req.session = null;
  let templateVars = { 
    shortURL: req.params.id,
    longURL: urlDatabase1[req.params.id],
    user: user
  };
  res.render('logout',templateVars);
})

app.post('/logout', (req, res) => {
  if(req.cookies['user_id']){
    res.clearCookie('user_id');
  }
  res.redirect('urls'); 
})

app.get("/register", (req, res) => {
  const user = {};
  let templateVars = { 
    urls: urlDatabase1,
    user_id: false,
    email: false,
    error: false,
    message: false,
    emailError: false,
    user: user
   };
   
  if(!req.cookies['user_id']){
    res.render('register', templateVars);
  } 
   
})

function validateData(data) {
   
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
   
  const id = generateUserID();
   
  let user = {};
  const valid = validateData(req.body);
   
  if (valid){
    const id_str = id.toString();
    const email = req.body.email;
    const existing = checkExistingEmail(email);
    if (!existing){
      const password = req.body.password;
      const hashedPassword = bcrypt.hashSync(password, 10);
      user = {
        id: id_str,
        email: email,
        hashedPassword: hashedPassword
      }
      users[id] = user;
      res.cookie('user_id', id_str);
      req.session.user_id = id_str;

      res.redirect('urls');
       
    } else {
      let tmp_id = req.cookie['user_id']? req.cookie['user_id'] : '';
      const user = { id : tmp_id};
      let templateVars = { 
        urls: urlDatabase1,
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
    let user = {
      email: req.body.email,
      password: req.body.password,
      id: ''
    }
    let templateVars = { 
      urls: urlDatabase1,
      error: true,
      message: 'all fields are required',
      user: user 
     };
     res.status(400);
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
//console.log('8080 is the magic port');
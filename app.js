const express = require("express");
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const config = require('./config/database');
const passport = require('passport');

// Bring in Person Model
let Person = require("./models/person");

mongoose.connect(config.database);
let db = mongoose.connection;

// Check connection
db.once('open',function(){
	console.log('Connected to MongoDB................');
});

// Check for DB errors
db.on('error', function(err){
	console.log("The following erros occurred while connecting with MongoDB:")
	console.log(err);
});

// Init App
const app = express();

// Express session Middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function(req, res, next){
	res.locals.messages = require('express-messages')(req, res);
	next();
});

// Bring in Models
let Article = require("./models/article");

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// BodyParser Middleware
// parse application/json
app.use(bodyParser.json())

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
	res.locals.user = req.user || null;
	next();
})
// Home Route
app.get('/', ensureAuthenticated, function(req, res){
	Person.find({}, function(err, person){
		if(err){
			console.log("Following Errors occurred in Person.find() function: ");
			console.log(err);
		} else {
			Article.find({}, function(err, articles){
				res.render('index',{
				articles: articles,
				person: person
			});
			});
		}
	});
});

// Route Files
let articles = require('./routes/articles');
let person=require('./routes/person');
let users = require('./routes/users');
app.use('/articles',articles);
app.use('/person',person);
app.use('/users', users);

// Access Control
function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		req.flash('danger', 'Please login');
		res.redirect('/users/login');
	}
}

// Services Route
app.get('/services', ensureAuthenticated, function(req, res){
	res.render('services', {

	});
});

// About Route
app.get('/about', ensureAuthenticated, function(req, res){
	res.render('about', {

	});
});

// Start Server
app.listen(3000, function(){
	console.log('Server started on port 3000...');
});
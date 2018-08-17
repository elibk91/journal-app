let express = require('express');
let app = express();
let handlebars = require('express-handlebars').create({defaultLayout:'main'});
app.use(express.static('public'));
let bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 30025);
var session = require('express-session');
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;
app.use(session({ secret: "cats" }));
app.use(passport.initialize());
app.use(passport.session());
var bcrypt = require('bcryptjs');
var expressValidator = require('express-validator');
app.use(expressValidator())


//authentification for db
let mysql = require('./db_auth.js');

//db query functions
let db_query = require('./db_queries.js');

//passport local strategy
passport.use(new LocalStrategy(function(username, password, done) {
		db_query.doesUsernameExist(username, function (error, userExists) {
		if(!userExists){
			//no user by that username
			return done(null, false);
		}
		else{
			db_query.getPassHashFromUsername(username, function (error, pwInDB) {
				//compare entered pw with pw for that user in DB
				bcrypt.compare(password, pwInDB, function(err, result) {
					if (result){
						//pw is correct, log user in
						console.log("and pw is correct");
						return done(null, username);
					} 
					else {
						console.log("but pw is incorrect");
						return done(null, false);
					}
				});
			});
		}
	});
}));

//passport serialization functions
passport.serializeUser(function(user, done) {
	done(null, user);
});
passport.deserializeUser(function(user, done) {
	  done(null, user);
});


/////////////////////////////////////////////////////////////////////
//ROUTES
//////////////////////////////////////////////////////////////////////

app.post('/login', passport.authenticate('local', 
	{ successRedirect: '/', failureRedirect: '/login', failureFlash: false })
);

app.get('/login', function (req, res) {
	res.render('login');
});

app.get('/logout', function(req, res){
	req.logout();
	res.redirect('/');
});


app.post('/register',function(req,res){
	// Validation
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
	var errors = req.validationErrors();

	//check if user exists
	db_query.doesUsernameExist(req.body.username, function (error, userExists) {
		if(userExists){
			let context = {};
			//no user by that username
			
			context.usernameExists = "username already exists";
			res.render('register', context);
		}
		else{

			if (errors) {
				res.render('register', {
					errors: errors
				});
			}
			else {
				bcrypt.genSalt(10, function(err, salt) {
					bcrypt.hash(req.body.password, salt, function(err, hash) {
						let password = hash;
			
						//store username, password in array
						let inputArr = [req.body.username, password];	
			
						//insert new row into DB
						db_query.createUser(inputArr, res);
						res.redirect('/login');
					});
				});
			}
		}
	});
	


});

app.get('/register', function (req, res) {
	res.render('register');
});

app.post('/',function(req,res,next){
	let context = {};
	let username = req.user;

	console.log(req.body);

	//get today's date
	let today = new Date();
	//store user, jorunal entry from form, and today's date in array
	let inputArr = [username, req.body.entry, today];	

	//insert new row into DB
	db_query.createEntry(inputArr, res);

	res.render('home');
	console.log("post request to home")
});

app.get('/',function(req,res,next){
	let context = {};
	let username = req.user;
	context.username = username;

	if(req.isAuthenticated() == false){
		res.redirect('/login');
	}
	else{
		res.render('home', context);
		console.log("get request to home")
	}
	//passport auth logs
	console.log("user is: " + req.user);
	console.log("user is authenticated? " + req.isAuthenticated());
});

app.get('/getData',function(req,res,next){
    //send data from DB as response to handlebars view and render page
	db_query.read(res, req.user, "journal_entries");

	console.log("entry data read from DB")
});


app.post('/update/:id',function(req,res,next){
	let id = req.params.id;
	let context = {};

	//update row
	db_query.updateRow(id, req);
});

app.post('/delete-data',function(req,res){
	//delete row by id
	db_query.deleteRow(req.body.id, "journal_entries");
});

app.use(function(req,res){
	res.type('text/plain');
	res.status(404);
	res.send('404 - Not Found');
});

app.use(function(err, req, res, next){
	console.error(err.stack);
	res.type('plain/text');
	res.status(500);
	res.send('500 - Server Error');
});

//for testing on localhost
// app.listen(app.get('port'), function(){
// 	console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
// });

//For deployment to heroku
app.listen(process.env.PORT, process.env.IP, function(){
    console.log('server is now running');
})
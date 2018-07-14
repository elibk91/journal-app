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

//authentification for db
let mysql = require('./db_auth.js');

//db query functions
let db_query = require('./db_queries.js');


app.get('/',function(req,res,next){
	res.render('home');
	console.log("get request to home")
});


app.get('/getData',function(req,res,next){
    //send data from DB as response to handlebars view and render page
	db_query.read(res, "journal_entries");

	console.log("entry data read from DB")
});

app.post('/',function(req,res,next){
	let context = {};
	let username = "test_user" 	//TODO: make this change with specific user

	//get today's date
	let today = new Date();
	//store user, jorunal entry from form, and today's date in array
	let inputArr = [username, req.body.entry, today];	

	//insert new row into DB, send data from DB as response to handlebars view, and render page
	db_query.createEntry(inputArr, res);

	res.render('home');
	console.log("post request to home")
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

    //send data from DB as response to handlebars view and render page
	db_query.read(res, "journal_entries");
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

app.listen(app.get('port'), function(){
	console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});

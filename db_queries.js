//authentification for db
let mysql = require('./db_auth.js');


//function to create row in DB
function createEntry(inputArr, res){
    //insert new row into DB
    mysql.pool.query("INSERT INTO journal_entries (`username`, `entry`, `date`) " + 
	"VALUES (?, ?, ?)", inputArr, function(err, result){
		if(err){
			//if error, log to console
			console.log(err);
			return;
		}
		else{
			console.log("new entry created")
		}
	});	
}

//function to read data from DB
function read(res, tableName){
	let context = {};
    //query DB
	mysql.pool.query('SELECT *, DATE_FORMAT(date, "%m-%d-%Y") AS date FROM ' + tableName + 
	" ORDER BY date(date) DESC, time(date) DESC;", function(err, rows, fields){	
		if(err){
			console.log(err);
			return;
		}
		else{
			//add rows queried from DB to context
			context.results = rows;

			//send data from DB as response
			res.send(context);
		}
	});
}


//function to update row
function updateRow(id, req){
	let inputArr = [id];

	//select row with proper id
	mysql.pool.query("SELECT * FROM journal_entries WHERE id=?", [inputArr], function(err, result){
		if(err){
			console.log(err);
			return;
		}

		//result should only be one entry (id is a primary key)
		if(result.length == 1){
			let currentVals = result[0];

			//update entry if provided, otherwise keep current entry
			mysql.pool.query("UPDATE journal_entries SET entry=? WHERE id=? ",
			[req.body.entry || currentVals.entry, id], function(err, result){
				if(err){
					console.log(err);
					return;
				}
			});
		}
	});
}

//function to delete row from DB using id
function deleteRow(id, tableName){
	mysql.pool.query("DELETE FROM " + tableName + " WHERE id=?", id, function(err, result){
		if(err){
			console.log(err);
			return;
		}
	});	
}

module.exports.createEntry = createEntry;
module.exports.read = read;
module.exports.updateRow = updateRow;
module.exports.deleteRow = deleteRow;
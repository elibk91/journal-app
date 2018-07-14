window.onload = function() {
	loadRows();
};


function loadRows(){
	let req = new XMLHttpRequest();
	req.open('GET', "/getData", true);

	req.onreadystatechange = function(){
		if(req.readyState === 4 && req.status === 200) {

			let payload = JSON.parse(req.responseText);
			
			//div to hold all entries
			let allEntries = document.getElementById('allEntries');

			for (let i = 0; i<payload.results.length; i++){
				generateRow(payload.results[i], allEntries);
			}
		}
	};
	req.send();
}


function generateRow(results, allEntries){
	//create div for entire entry
	let entryDiv = document.createElement("div");
	entryDiv.setAttribute("id", "entryRow" + 
	+ results.id);
	allEntries.appendChild(entryDiv);
	
	//create entry date p
	let dateP = document.createElement("p");
	let textnode = document.createTextNode(results.date);
	dateP.appendChild(textnode);
	entryDiv.appendChild(dateP);
	
	//create entry text p
	let entryTextP = document.createElement("p");
	textnode = document.createTextNode(results.entry);
	entryTextP.appendChild(textnode);
	entryTextP.setAttribute("id", "entryRowText" + 
	+ results.id);
	entryDiv.appendChild(entryTextP);

	//create buttons p
	let buttons = document.createElement("p");

	//create update button
	let updateButton = document.createElement("BUTTON");
	textnode = document.createTextNode("update");
	updateButton.appendChild(textnode);   
	updateButton.setAttribute("onClick", "updateRow(" 
	+ results.id + ")");

	//create delete button
	let deleteButton = document.createElement("BUTTON");
	textnode = document.createTextNode("delete");
	deleteButton.appendChild(textnode);
	deleteButton.setAttribute("onClick", "deleteRow(" 
	+ results.id + ")");

	buttons.appendChild(updateButton);
	buttons.appendChild(deleteButton);
	entryDiv.appendChild(buttons);

	//create update div
	let updateDiv = document.createElement("div");
	updateDiv.setAttribute("id", "updateDiv" + results.id);
	updateDiv.setAttribute("id", "updateDiv" + results.id);
	updateDiv.style.display = "none";

	//create "Edit ENtry" text"
	let text = document.createTextNode("Edit Entry:");
	updateDiv.appendChild(text);

	//line break
	linebreak = document.createElement("br");
	updateDiv.appendChild(linebreak);

	//create text box to update entry and add existing entry text
	let editBox = document.createElement("textarea");
	editBox.setAttribute("rows", "4");
	editBox.setAttribute("cols", "50");
	editBox.setAttribute("type", "text");
	editBox.setAttribute("id", "updateText" + results.id);
	updateDiv.appendChild(editBox);
	editBox.value = document.getElementById('entryRowText' + results.id).textContent;

	//line break
	linebreak = document.createElement("br");
	updateDiv.appendChild(linebreak);

	//create "save changes" button
	let saveChangesButton = document.createElement("BUTTON");
	textnode = document.createTextNode("save changes");
	saveChangesButton.appendChild(textnode);   
	saveChangesButton.setAttribute("onClick", "saveChanges(" 
	+ results.id + ")");
	updateDiv.appendChild(saveChangesButton);

	entryDiv.appendChild(updateDiv);
}

function deleteRow(id){
	console.log("deleting row " + id);

	//send id of row to be delete to "/delete-data" route
	let req = new XMLHttpRequest();
	req.open('POST', "/delete-data", true);
	req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	req.send("id=" + id);

	//hide deleted row
	let row = document.getElementById("entryRow"+id);
	row.style.display = "none";
}

function updateRow(id){
	document.getElementById("updateDiv"+id).style.display = "block";
}

function saveChanges(id){
	//send text of updated entry
	let req = new XMLHttpRequest();
	req.open('POST', "/update/" + id, true);
	req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	let updateText = document.getElementById("updateText" + id).value;
	req.send("entry=" + updateText);

	//remove update box and update entry
	document.getElementById("updateDiv"+id).style.display = "none";
	document.getElementById("entryRowText"+id).innerText = updateText;
}

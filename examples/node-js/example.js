
var fs = require('fs');
var util = require('util');


var enml = require('../../enml');


var text0 = fs.readFileSync('../ex0.txt','utf8');
var enml0 = enml.ENMLOfPlainText(text0);

console.log("================ Example 0 (TEXT) ================")
console.log(text0)

console.log("================ Example 0 (ENML) ================")
console.log(enml0)


var enml1 = fs.readFileSync('../ex1.enml','utf8');
var html1 = enml.HTMLOfENML(enml1);
var text1 = enml.PlainTextOfENML(enml1);

console.log("================ Example 1 (ENML) ================")
console.log(enml1)

console.log("================ Example 1 (HTML) ================")
console.log(html1)

console.log("================ Example 1 (TEXT) ================")
console.log(text1)

var note2 = fs.readFileSync('../note2.json','utf8');
var shardId = '48' //HARDCODE...
note2 = JSON.parse(note2);

var resources = {};
for(var i in note2.resources){
	var resource = note2.resources[i];
	
	var hash = ''
	for(var i=0;i<resource.data.bodyHash.length;i++){
	  
	  if(resource.data.bodyHash.charCodeAt(i) < 128 || resource.data.bodyHash.charCodeAt(i) == 65533 )
	    hash += resource.data.bodyHash.charAt(i)
	  else
	    hash += String.fromCharCode(65533) + String.fromCharCode(65533);
	}
	
	resources[hash] = enml.URLOfResource(resource.guid, shardId);
}

var html2 = enml.HTMLOfENML(note2.content, resources);
var text2 = enml.PlainTextOfENML(note2.content);

console.log("================ Example 2 (ENML) ================")
console.log(note2.content)

console.log("================ Example 2 (HTML) ================")
console.log(html2)

console.log("================ Example 2 (TEXT) ================")
console.log(text2)



var enml3 = fs.readFileSync('../ex3.enml','utf8');
var todos = enml.TodosOfENML(enml3);
var enml3_checked = enml.CheckTodoInENML(enml3, 0, true);

console.log("================ Example 3 (ENML) ================")
console.log(enml3)

console.log("================ Example 3 (TODOS) ===============")
console.log(todos)

console.log("===== Example 3 with 1st todo checked (ENML) =====")
console.log(enml3_checked)

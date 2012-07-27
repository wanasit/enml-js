
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

console.log("================ Example 0 (ENML) ================")
console.log(enml1)

console.log("================ Example 0 (HTML) ================")
console.log(html1)






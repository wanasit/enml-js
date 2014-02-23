var config = require(__dirname + '/config.js');

var util = require('util');
var should = require('should');
var async = require('async')

var enml = require(__dirname+'/../enml');

describe('enml',function() {
  
  var structured_email_samples = [];
  var unstructured_email_samples = [];

  //Load sample emails
  before(function(done) {

    if(!config.auth_token || config.auth_token == 'DEVELOPER_TOKEN') return done();


    


  })


  describe('#ENMLOfPlainText()',function() {
    
    it('should convert a given plain text to ENML' , function(){

      var plainText = ''
      +'Hickory, dickory, dock,\n'
      +'The mouse ran up the clock.\n'
      +'The clock struck one,\n'
      +'The mouse ran down,\n'
      +'Hickory, dickory, dock.\n'  
      +'\n'
      +'-- Author unknown';


      var expectedENML = ''
      +'<div>Hickory, dickory, dock,</div>\n'  
      +'<div>The mouse ran up the clock.</div>\n'  
      +'<div>The clock struck one,</div>\n'  
      +'<div>The mouse ran down,</div>\n'  
      +'<div>Hickory, dickory, dock.</div>\n'  
      //+'<div><br /></div>\n'  
      +'<div>-- Author unknown</div>\n';


      var convertedENML = enml.ENMLOfPlainText(plainText);

      convertedENML.should.include('<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">');
      convertedENML.should.include('<en-note');
      convertedENML.should.include('</en-note>');
      expectedENML.split('\n').forEach(function(div){
        convertedENML.should.include(div);
      })  
      
    })
    
  }) 
  
  describe('#PlainTextOfENML()',function() {
    
    
    
  }) 



})


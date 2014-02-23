var config = require(__dirname + '/config.js');

var util = require('util');
var should = require('should');
var async = require('async')

var enml = require(__dirname+'/../enml');
var Evernote = require('evernote').Evernote;

describe('enml',function() {
  
  var noteWithImage = null;

  //Load sample emails
  before(function(done) {

    if(!config.auth_token || config.auth_token == 'DEVELOPER_TOKEN') return done();


    var client = new evernote.Client({token: config.auth_token, sandbox: false});

    var noteKey = 'c7ed1df40ba9eab115450670b595ff32';
    var noteGuid = '1bce0f35-2360-45fe-808d-9b2b0b8a9a32';
    var noteStore = client.getNoteStore()

    noteStore.authenticateToSharedNote(noteGuid, noteKey, function(err, result){

      var client = new evernote.Client({token: result.authenticationToken, sandbox: false}); 
      var noteStore = client.getNoteStore()
      noteStore.getNote(noteGuid, true, true, true, true, function(err, _note){
        noteWithImage = _note;
        done();
      });
    });
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
    
    it('should able to handle en-media (image)', function(done){

      var fs = require('fs');
      var html = enml.HTMLOfENML(noteWithImage.content, note.resources);
      html.should.include('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/7QBIUGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAA8cAVoAAxslRxwCAAACAAIAOEJJTQQlAAAAAAAQ/OEfici3yXgvNGI0B1h36//hACRFeGlmAABJSSoACAAAAAEAmIICAAAAAAAAAAAAAAAAAAAA/+EDKWh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8APD94cGFja2V0IGJl')
      done()
    })
  })
})


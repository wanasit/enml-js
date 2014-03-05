(function() {

  // Convert Uint8Array to base64 string
  //  https://gist.github.com/jonleighton/958841
  function base64ArrayBuffer(bytes) {
    var base64    = ''
    var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

    var byteLength    = bytes.byteLength
    var byteRemainder = byteLength % 3
    var mainLength    = byteLength - byteRemainder
   
    var a, b, c, d
    var chunk
   
    // Main loop deals with bytes in chunks of 3
    for (var i = 0; i < mainLength; i = i + 3) {
      // Combine the three bytes into a single integer
      chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]
   
      // Use bitmasks to extract 6-bit segments from the triplet
      a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
      b = (chunk & 258048)   >> 12 // 258048   = (2^6 - 1) << 12
      c = (chunk & 4032)     >>  6 // 4032     = (2^6 - 1) << 6
      d = chunk & 63               // 63       = 2^6 - 1
   
      // Convert the raw binary segments to the appropriate ASCII encoding
      base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
    }
   
    // Deal with the remaining bytes and padding
    if (byteRemainder == 1) {
      chunk = bytes[mainLength]
   
      a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2
   
      // Set the 4 least significant bits to zero
      b = (chunk & 3)   << 4 // 3   = 2^2 - 1
   
      base64 += encodings[a] + encodings[b] + '=='
    } else if (byteRemainder == 2) {
      chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]
   
      a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
      b = (chunk & 1008)  >>  4 // 1008  = (2^6 - 1) << 4
   
      // Set the 2 least significant bits to zero
      c = (chunk & 15)    <<  2 // 15    = 2^4 - 1
   
      base64 += encodings[a] + encodings[b] + encodings[c] + '='
    }
    
    return base64
  }


  /**
  * ENMLOfPlainText
  * @param  { string } text (Plain)
  * @return string - ENML
  */
  function ENMLOfPlainText(text){

    var writer = new XMLWriter();

    writer.startDocument = writer.startDocument || writer.writeStartDocument;
    writer.endDocument = writer.endDocument || writer.writeEndDocument;
    writer.startDocument = writer.startElement || writer.writeStartElement;
    writer.startDocument = writer.endElement || writer.writeEndElement;

    writer.startDocument('1.0', 'UTF-8', false);
    writer.write('<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">');
    writer.write("\n");
    writer.startElement('en-note');
    writer.writeAttribute('style', 'word-wrap: break-word; -webkit-nbsp-mode: space; -webkit-line-break: after-white-space;');

    var lines = text.match(/^.*((\r\n|\n|\r)|$)/gm);

    lines.forEach(function(line) {
      writer.text("\n");
      writer.startElement('div');
      writer.text(line.replace(/(\r\n|\n|\r)/,''));
      writer.endElement();
    });

    writer.text("\n");
    writer.endElement();
    writer.endDocument();

    return writer.toString();
  }

  /**
  * PlainTextOfENML
  * @param  { string } text (ENML)
  * @return string - text
  */
  function PlainTextOfENML(enml){

    var text = enml || '';
    text = text.replace(/(\r\n|\n|\r)/gm," ");
    text = text.replace(/(<\/(div|ui|li|p|table|tr|dl)>)/ig,"\n");
    text = text.replace(/^\s/gm,"");
    text = text.replace(/(<(li)>)/ig," - ");
    text = text.replace(/(<([^>]+)>)/ig,"");
   	text = text.trim()

    return text;
  }




  /**
  * HTMLOfENML
  * Convert ENML into HTML for showing in web browsers.
  *
  * @param { string } text (ENML)
  * @param  { Map <string (hash), url (string) || { url: (string), title: (string) } >, Optional } resources
  * @return string - HTML
  */
  function HTMLOfENML(text, resources){

    resources = resources || [];

    var resource_map = {}
    resources.forEach(function(resource){

      var hex = [].map.call( resource.data.bodyHash, 
        function(v) { str = v.toString(16); 
        return str.length < 2 ? "0" + str : str;  }).join("");

      resource_map[hex] = resource;
    })

    var writer = new XMLWriter();
    var parser = new SaxParser(function(cb) {

      var mediaTagStarted = false;
      var linkTagStarted = false;
      var linkTitle;

      cb.onStartElementNS(function(elem, attrs, prefix, uri, namespaces) {

        if(elem == 'en-note'){
          writer.startElement('html');
          writer.startElement('head');

          writer.startElement('meta');
          writer.writeAttribute('http-equiv', 'Content-Type');
          writer.writeAttribute('content', 'text/html; charset=UTF-8');
          writer.endElement();

          writer.endElement();

          writer.startElement('body');
          if(!(attrs && attrs[0] && attrs[0][0] && attrs[0][0] === 'style'))
            writer.writeAttribute('style', 'word-wrap: break-word; -webkit-nbsp-mode: space; -webkit-line-break: after-white-space;');
        } else if(elem == 'en-todo'){

          writer.startElement('input');
          writer.writeAttribute('type', 'checkbox');

        } else if(elem == 'en-media'){

          var type = null;
          var hash = null;
          var width = 0;
          var height = 0;

          if(attrs) attrs.forEach(function(attr) {
            if(attr[0] == 'type') type = attr[1];
            if(attr[0] == 'hash') hash = attr[1];
            if(attr[0] == 'width') width = attr[1];
            if(attr[0] == 'height') height = attr[1];
          });

          var resource = resource_map[hash];
          
          if(!resource) return;
          var resourceTitle = resource.title || '';
          
          if(type.match('image')) {

            writer.startElement('img');
            writer.writeAttribute('title', resourceTitle);

          } else if(type.match('audio')) {
            
            
            writer.writeElement('p', resourceTitle);
            writer.startElement('audio');
            writer.writeAttribute('controls', '');
            writer.text('Your browser does not support the audio tag.');
            writer.startElement('source');
            mediaTagStarted = true;

          } else if(type.match('video')) {
            writer.writeElement('p', resourceTitle);
            writer.startElement('video');
            writer.writeAttribute('controls', '');
            writer.text('Your browser does not support the video tag.');
            writer.startElement('source');
            mediaTagStarted = true;
          } else {
            writer.startElement('a');
            linkTagStarted = true;
            linkTitle = resourceTitle;
          }
          
          if(resource.data.body) {
            var b64encoded = base64ArrayBuffer(resource.data.body);
            var src = 'data:'+type+';base64,'+b64encoded;
            writer.writeAttribute('src', src)
          }

          if(width) writer.writeAttribute ('width', width);
          if(height) writer.writeAttribute('height', height);

        } else {
          writer.startElement(elem);
        }

        if(attrs) attrs.forEach(function(attr) {
          writer.writeAttribute(attr[0], attr[1]);
        });

      });
      cb.onEndElementNS(function(elem, prefix, uri) {

        if(elem == 'en-note'){
          writer.endElement(); //body
          writer.endElement(); //html
        }
        else if(elem == 'en-todo'){

        }
        else if(elem == 'en-media'){
          if(mediaTagStarted) {
            writer.endElement(); // source
            writer.endElement(); // audio or video
            writer.writeElement('br', '');
            mediaTagStarted = false;

          } else if(linkTagStarted) {
            writer.text(linkTitle);
            writer.endElement(); // a
            linkTagStarted = false;

          } else {
            writer.endElement();
          }

        } else {

          writer.endElement();
        }
      });
      cb.onCharacters(function(chars) {
        writer.text(chars);
      });

    });

    parser.parseString(text);
    return writer.toString();

  }


  /**
  * TodosOfENML
  * Extract data of all TODO(s) in ENML text.
  *
  * @param { string } text (ENML)
  * @return { Array [ { text: (string), done: (bool) } ] } -
  */
  function TodosOfENML(text){

    var todos = [];


    var parser = new SaxParser(function(cb) {

      var onTodo = false;
      var text = null;
      var checked = false;

      cb.onStartElementNS(function(elem, attrs, prefix, uri, namespaces) {
        var m = elem.match(/b|u|i|font|strong/);
        if(m && elem == m[0]){

        }
        else if(elem == 'en-todo'){

          checked = false;
          text = "";
          onTodo = true;

          if(attrs) attrs.forEach(function(attr) {
            if(attr[0] == 'checked' && attr[1] == 'true') checked = true;
          });

        } else {
          if(onTodo){
            todos.push({text: text, checked: checked});
          }
          onTodo = false;
        }

      });
      cb.onEndElementNS(function(elem, prefix, uri) {

      });
      cb.onCharacters(function(chars) {
        if(onTodo){
          text += chars;
        }
      });

      cb.onEndDocument(function(){
        if (onTodo) {
          todos.push({text: text, checked: checked});
        }
      });
    });

    parser.parseString(text);
    return todos;
  }

  /**
  * CheckTodoInENML
  * Rewrite ENML content by changing check/uncheck value of the TODO in given position.
  *
  * @param { string } text (ENML)
  * @param { int }  index
  * @param { bool } check
  * @return string - ENML (the new content)
  */
  function CheckTodoInENML(text, index, check){

    var todo_cout = 0;
    var writer = new XMLWriter();
    var parser = new SaxParser(function(cb) {

      cb.onStartElementNS(function(elem, attrs, prefix, uri, namespaces) {

        writer.startElement(elem);


        if(elem == 'en-todo' && index == todo_cout++){

          if(attrs) attrs.forEach(function(attr) {
            if(attr[0] == 'checked') return;
            writer.writeAttribute(attr[0], attr[1]);
          });

          if(check)  writer.writeAttribute('checked', 'true');
        }else{

          if(attrs) attrs.forEach(function(attr) {
            writer.writeAttribute(attr[0], attr[1]);
          });
        }
      });
      cb.onEndElementNS(function(elem, prefix, uri) {

        writer.endElement();
      });
      cb.onCharacters(function(chars) {
        writer.text(chars);
      });

    });

    parser.parseString(text);
    return writer.toString();
  }

  var XMLWriter;
  var SaxParser;
  if(typeof exports == 'undefined'){

    XMLWriter = window.XMLWriter;
    SaxParser = window.SaxParser;

    //Browser Code
    window.enml = {};

    window.enml.ENMLOfPlainText = ENMLOfPlainText;
    window.enml.HTMLOfENML      = HTMLOfENML;
    window.enml.PlainTextOfENML = PlainTextOfENML;
    window.enml.TodosOfENML     = TodosOfENML;
    window.enml.CheckTodoInENML = CheckTodoInENML;
  }
  else{

    //Node JS
    XMLWriter = require('./lib/xml-writer');
    SaxParser = require('./lib/xml-parser').SaxParser;

    exports.ENMLOfPlainText = ENMLOfPlainText;
    exports.HTMLOfENML      = HTMLOfENML;
    exports.PlainTextOfENML = PlainTextOfENML;
    exports.TodosOfENML     = TodosOfENML;
    exports.CheckTodoInENML = CheckTodoInENML;
  }

})();

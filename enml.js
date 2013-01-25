(function() {

	/**
	 * URLOfResource
	 *  Create URL of the resource on Evernote's server
	 * @param  { string } guid 		- the resource's guid
	 * @param  { string } shardId - shard id of the resource owner
	 * @return string - URL
	 */
	function URLOfResource(guid, shardId){
		return 'https://www.evernote.com/shard/'+shardId+'/res/'+guid;
	}
	
	/**
	 * enmlHashToBodyHash
	 *  'bodyHash' returned from Evernote API is not equal to 'enmlHash' (hash string in the notes' content).
	 *  'enmlHash' is 'bodyHash' in ascii-hex form
	 * @param  { string } enmlHash - (Hash string in notes' content)
	 * @return string - bodyHash 		(Binary hash in Evernote API)
	 */
	function BodyHashOfENMLHash(enmlHash){
		
		var buffer = [];
		for(var i =0 ; i<enmlHash.length; i += 2) 
			buffer.push( parseInt(enmlHash[i],16)*16 + parseInt(enmlHash[i+1],16));

		var bodyHash = '';
		for(var i =0 ; i<buffer.length; i ++){
			if(buffer[i] >= 128)
				bodyHash += String.fromCharCode(65533);
			else
				bodyHash += String.fromCharCode(buffer[i]);
		} 
		
		return bodyHash;
	}
	
	/**
	 * ENMLOfPlainText
	 * @param  { string } text (Plain)
	 * @return string - ENML
	 */
	function ENMLOfPlainText(text){

		var writer = new XMLWriter;
		
		writer.startDocument = writer.startDocument || writer.writeStartDocument;
		writer.endDocument 	 = writer.endDocument || writer.writeEndDocument;
		writer.startDocument = writer.startElement || writer.writeStartElement;
		writer.startDocument = writer.endElement || writer.writeEndElement;
		
		writer.startDocument('1.0', 'UTF-8', false);
		writer.write('<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">');
		writer.write("\n")
		writer.startElement('en-note');
		writer.writeAttribute('style', 'word-wrap: break-word; -webkit-nbsp-mode: space; -webkit-line-break: after-white-space;');

		var lines = text.match(/^.*((\r\n|\n|\r)|$)/gm);

		lines.forEach(function(line) {
			writer.startElement('div');
			writer.text(line.replace(/(\r\n|\n|\r)/,''));
			writer.endElement();

			writer.text("\n")
		});

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
  	text = text.replace(/(<\/(div|ui|li)>)/ig,"\n");
  	text = text.replace(/(<(li)>)/ig," - ");
  	text = text.replace(/(<([^>]+)>)/ig,"");
  	text = text.replace(/(\r\n|\n|\r)/gm," ");
  	text = text.replace(/(\s+)/gm," ");
    
		return text;
	}
  
	/**
	 * HTMLOfENML
	 * 	Convert ENML into HTML for showing in web browsers. 
	 *
	 * @param { string } text (ENML)
	 * @param { string } shard ( shardId )
	 * @param	{ Map <string (hash), string (url) >, Optional } resources
	 * @return string - HTML
	 */
	function HTMLOfENML(text, resources){

		resources = resources || {};
		var writer = new XMLWriter;
		
		var parser = new SaxParser(function(cb) {

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
					writer.writeAttribute('style', 'word-wrap: break-word; -webkit-nbsp-mode: space; -webkit-line-break: after-white-space;');
				} else if(elem == 'en-todo'){

					writer.startElement('input');
					writer.writeAttribute('type', 'checkbox');

				}	else if(elem == 'en-media'){

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

	        if(!type.match('image')) return;
	        writer.startElement('img');
					
					hash = BodyHashOfENMLHash(hash);					
					var resource = resources[hash];
					
					if(resource) {
						writer.writeAttribute('src', resource);
					}
          
					if(width) writer.writeAttribute('width', width);
					if(height) writer.writeAttribute('height', height);

				}	else {
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

					}else{

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

	if(typeof exports == 'undefined'){
	  
	  var XMLWriter = window.XMLWriter;
		var SaxParser = window.SaxParser;
	  
	   //Browser Code
		window.enml = {};
		window.enml.URLOfResource = URLOfResource;
		window.enml.ENMLOfPlainText = ENMLOfPlainText;
		window.enml.HTMLOfENML = HTMLOfENML;
		window.enml.PlainTextOfENML = PlainTextOfENML;
	}
	else{

		//Node JS
		var XMLWriter = require('./lib/xml-writer');
		var SaxParser = require('./lib/xml-parser').SaxParser;

		exports.URLOfResource = URLOfResource;
		exports.ENMLOfPlainText = ENMLOfPlainText;
		exports.HTMLOfENML = HTMLOfENML;
		exports.PlainTextOfENML = PlainTextOfENML;
	}
	
})()

if(typeof exports == 'undefined'){
   //Browser Code

}
else{
	
	//Node JS
	var XMLWriter = require('xml-writer');
	var xml 			= require('node-xml');
	
	exports.ENMLOfPlainText = ENMLOfPlainText;
	exports.HTMLOfENML = HTMLOfENML;
}

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
 * ENMLOfPlainText
 * @param  { string } text (Plain)
 * @return string - ENML
 */
function ENMLOfPlainText(text){
	
	var writer = new XMLWriter;
	
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
 * HTMLOfENML
 * 	Convert ENML into HTML for showing in web browsers. 
 *
 * @param { string } text (ENML)
 * @param { string } shard ( shardId )
 * @param	{ Map <string (hash), string (url) >, Optional } resources
 * @return string - HTML
 */
function HTMLOfENML(text, shard, resources){
	
	resources = resources || {};
	var writer = new XMLWriter;
	var parser = new xml.SaxParser(function(cb) {
	
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
				
				var buffer = new Buffer(hash, 'hex');
				hash = buffer.toString('ascii');
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



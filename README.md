enml-js
===========

[Evernote's ENML](http://dev.evernote.com/documentation/cloud/chapters/ENML.php) library in Javascript.

## INSTALLATION

### Node.js

    npm install enml-js

### Browser

    <script src="https://raw.github.com/berryboy/enml-js/master/enml.js"></script> 
    <script src="https://raw.github.com/berryboy/enml-js/master/lib/xml-writer.js"></script>
    <script src="https://raw.github.com/berryboy/enml-js/master/lib/xml-parser.js"></script> 

Functions
============

**enml.ENMLOfPlainText**(String) - Encode plain text in ENML format.
    
    > enml.ENMLOfPlainText("Hello  World!!")
    '<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">\n<en-note style="word-wrap: break-word; -webkit-nbsp-mode: space; -webkit-line-break: after-white-space;"><div>Hello  World!!</div>\n</en-note>'

    > enml.ENMLOfPlainText("Hello\nWorld!!")
    '<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">\n<en-note style="word-wrap: break-word; -webkit-nbsp-mode: space; -webkit-line-break: after-white-space;"><div>Hello</div>\n<div>World!!</div>\n</en-note>'

**enml.HTMLOfENML**(String, [ Map <String, URL> ]) - Translate ENML to HTML for viewing in browsers. Showing images you have to provide a map of images' hash and their src url.

    > enml.HTMLOfENML('<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">\n<en-note style="word-wrap: break-word; -webkit-nbsp-mode: space; -webkit-line-break: after-white-space;"><div>Hello</div>\n<div>World!!</div>\n</en-note>')
    '<html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/></head><body style="word-wrap: break-word; -webkit-nbsp-mode: space; -webkit-line-break: after-white-space;" style="word-wrap: break-word; -webkit-nbsp-mode: space; -webkit-line-break: after-white-space;"><div>Hello</div>\n<div>World!!</div>\n</body></html>'


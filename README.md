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

* **enml.ENMLOfPlainText**(String) - Encode plain text in ENML format.

* **enml.HTMLOfENML**(String, [ Map <String, URL> ]) - Translate ENML to HTML for viewing in browsers. Showing images you have to provide a map of images' hash and their src url.


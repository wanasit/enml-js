/*global ActiveXObject, window, document */
/*
Copyright or © or Copr. Nicolas Debeissat, Brett Zamir

nicolas.debeissat@gmail.com (http://debeissat.nicolas.free.fr/) brettz9@yahoo.com

This software is a computer program whose purpose is to parse XML
files respecting SAX2 specifications.

This software is governed by the CeCILL license under French law and
abiding by the rules of distribution of free software. You can use,
modify and/ or redistribute the software under the terms of the CeCILL
license as circulated by CEA, CNRS and INRIA at the following URL
"http://www.cecill.info".

As a counterpart to the access to the source code and rights to copy,
modify and redistribute granted by the license, users are provided only
with a limited warranty and the software's author, the holder of the
economic rights, and the successive licensors have only limited
liability.

In this respect, the user's attention is drawn to the risks associated
with loading, using, modifying and/or developing or reproducing the
software by the user in light of its specific status of free software,
that may mean that it is complicated to manipulate, and that also
therefore means that it is reserved for developers and experienced
professionals having in-depth computer knowledge. Users are therefore
encouraged to load and test the software's suitability as regards their
requirements in conditions enabling the security of their systems and/or
data to be ensured and, more generally, to use and operate it in the
same conditions as regards security.

The fact that you are presently reading this means that you have had
knowledge of the CeCILL license and that you accept its terms.

*/

/* sax 2 methods
 void 	attributeDecl(java.lang.String eName, java.lang.String aName, java.lang.String type, java.lang.String mode, java.lang.String value)
          Report an attribute type declaration.
 void 	comment(char[] ch, int start, int length)
          Report an XML comment anywhere in the document.
 void 	elementDecl(java.lang.String name, java.lang.String model)
          Report an element type declaration.
 void 	endCDATA()
          Report the end of a CDATA section.
 void 	endDTD()
          Report the end of DTD declarations.
 void 	endEntity(java.lang.String name)
          Report the end of an entity.
 void 	externalEntityDecl(java.lang.String name, java.lang.String publicId, java.lang.String systemId)
          Report a parsed external entity declaration.
 InputSource 	getExternalSubset(java.lang.String name, java.lang.String baseURI)
          Tells the parser that if no external subset has been declared in the document text, none should be used.
 void 	internalEntityDecl(java.lang.String name, java.lang.String value)
          Report an internal entity declaration.
 InputSource 	resolveEntity(java.lang.String publicId, java.lang.String systemId)
          Invokes EntityResolver2.resolveEntity() with null entity name and base URI.
 InputSource 	resolveEntity(java.lang.String name, java.lang.String publicId, java.lang.String baseURI, java.lang.String systemId)
          Tells the parser to resolve the systemId against the baseURI and read the entity text from that resulting absolute URI.
 void 	startCDATA()
          Report the start of a CDATA section.
 void 	startDTD(java.lang.String name, java.lang.String publicId, java.lang.String systemId)
          Report the start of DTD declarations, if any.
 void 	startEntity(java.lang.String name)
          Report the beginning of some internal and external XML entities.
*/

// Begin namespace
(function () {

/* Private static helper function */
function _createDocument() {
    // code for IE
    var doc;
    if (window.ActiveXObject) {
        doc = new ActiveXObject("Microsoft.XMLDOM");
        doc.async = "false";
    }
    // code for Mozilla, Firefox
    else {
        doc = document.implementation.createDocument(null, "", null);
    }
    return doc;
}

/* Private static helpers treated below as private instance methods, so don't need to add these to the public API; we might use a Relator to also get rid of non-standard public properties */
function _appendToCurrentElement (node) {
    if (!this.currentElement) {
        this.document.appendChild(node);
    } else {
        this.currentElement.appendChild(node);
    }
}
function _addAtts(atts) {
    for (var i = 0 ; i < atts.getLength() ; i++) {
        var namespaceURI = atts.getURI(i);
        var value = atts.getValue(i);
        if (namespaceURI === '' || namespaceURI === null) { // namespaceURI should be null, not empty string, no?
            var localName = atts.getLocalName(i);
            this.currentElement.setAttribute(localName, value);
        } else {
            var qName = atts.getQName(i);
            this.currentElement.setAttributeNS(namespaceURI, qName, value);
        }
    }
}
function _addNsDecls () { // Will add namespaces (for true XHTML) where they are declared (even if not used at that point)
    if (this.currentElement.setAttributeNodeNS) {
        for (var prefix in this.currentAttNodes) {
            this.currentElement.setAttributeNodeNS(this.currentAttNodes[prefix]);
        }
        this.currentAttNodes = {};
    }
}
function _setBaseUri(atts) {
    this.currentElement.custBaseURI = this.currentElement.parentNode.custBaseURI;
    for (var i = 0 ; i < atts.getLength() ; i++) {
        var namespaceURI = atts.getURI(i);
        if (namespaceURI === "http://www.w3.org/XML/1998/namespace") {
            var localName = atts.getLocalName(i);
            if (localName === "base") {
                var xmlBase = atts.getValue(i);
                //remove eventual file name at the end of URI and append xmlBase
                var idx = this.currentElement.custBaseURI.lastIndexOf('/');
                this.currentElement.custBaseURI = this.currentElement.custBaseURI.substring(0, idx + 1) + xmlBase;
            }
        }
    }
}

// CLASS (could be renamed or aliased to DefaultHandler2): http://www.saxproject.org/apidoc/org/xml/sax/ext/DefaultHandler2.html
function DomContentHandler() {
    this.saxParseExceptions = [];
    this.currentAttNodes = {};
    //if text coming is inside a cdata section then this boolean will be set to true
    this.cdata = false;
}

DomContentHandler.prototype.toString = function () {
    return "DomContentHandler";
}

// INTERFACE: ContentHandler: http://www.saxproject.org/apidoc/org/xml/sax/ContentHandler.html
// implemented in DefaultHandler, DefaultHandler2:
//  http://www.saxproject.org/apidoc/org/xml/sax/helpers/DefaultHandler.html and
//  http://www.saxproject.org/apidoc/org/xml/sax/ext/DefaultHandler2.html
DomContentHandler.prototype.startDocument = function() {
    this.document = _createDocument();
    if (this.locator) {
        //baseURI is read only (and not supported on IE)
        this.document.custBaseURI = this.locator.getSystemId();
    }
};
DomContentHandler.prototype.startElement = function(namespaceURI, localName, qName, atts) {
    var element;
    if (namespaceURI === '' || namespaceURI === null) { // namespaceURI should be null, not empty string, no?
        element = this.document.createElement(localName);
    } else {
        element = this.document.createElementNS(namespaceURI, qName);
    }
    _appendToCurrentElement.call(this, element);
    this.currentElement = element;
    _addAtts.call(this, atts);
    _addNsDecls.call(this);
    _setBaseUri.call(this, atts);
};
DomContentHandler.prototype.endElement = function(namespaceURI, localName, qName) {
    this.currentElement = this.currentElement.parentNode;
};
DomContentHandler.prototype.startPrefixMapping = function(prefix, uri) {
    /* not supported by all browsers*/
    if (this.document.createAttributeNS) {
        // We need to store the declaration for later addition to the element, since the
        //   element is not yet available
        var qName = prefix ? "xmlns:" + prefix : "xmlns";
        var att = this.document.createAttributeNS("http://www.w3.org/2000/xmlns/", qName);
        att.nodeValue = uri;
        if (!prefix) {
            prefix = ':'; // Put some unique value as our key which a prefix cannot use
        }
        this.currentAttNodes[prefix] = att;
    }
};
DomContentHandler.prototype.endPrefixMapping = function(prefix) {
};
DomContentHandler.prototype.processingInstruction = function(target, data) {
    var procInst = this.document.createProcessingInstruction(target, data);
    _appendToCurrentElement.call(this, procInst);
};
DomContentHandler.prototype.ignorableWhitespace = function(ch, start, length) {
};
DomContentHandler.prototype.characters = function(ch, start, length) {
    if (this.cdata) {
        var cdataNode = this.document.createCDATASection(ch);
        this.currentElement.appendChild(cdataNode);
    } else {
        var textNode = this.document.createTextNode(ch);
        this.currentElement.appendChild(textNode);
    }
};
DomContentHandler.prototype.skippedEntity = function(name) {
};
DomContentHandler.prototype.endDocument = function() {
};
DomContentHandler.prototype.setDocumentLocator = function (locator) {
    this.locator = locator;
};


// INTERFACE: DeclHandler: http://www.saxproject.org/apidoc/org/xml/sax/ext/DeclHandler.html

DomContentHandler.prototype.attributeDecl = function(eName, aName, type, mode, value) {};

DomContentHandler.prototype.elementDecl = function(name, model) {};

DomContentHandler.prototype.externalEntityDecl = function(name, publicId, systemId) {};

DomContentHandler.prototype.internalEntityDecl = function(name, value) {};



// INTERFACE: LexicalHandler: http://www.saxproject.org/apidoc/org/xml/sax/ext/LexicalHandler.html
DomContentHandler.prototype.comment = function(ch, start, length) {
    var commentNode = this.document.createComment(ch);
    _appendToCurrentElement.call(this, commentNode);
};

DomContentHandler.prototype.endCDATA = function() {
    //used in characters() methods
    this.cdata = false;
};

DomContentHandler.prototype.endDTD = function() {};
DomContentHandler.prototype.endEntity = function(name) {};

DomContentHandler.prototype.startCDATA = function() {
    //used in characters() methods
    this.cdata = true;
};

DomContentHandler.prototype.startDTD = function(name, publicId, systemId) {
    if (document.implementation && document.implementation.createDocumentType) {
        var dt = document.implementation.createDocumentType(name, publicId, systemId);
        _appendToCurrentElement.call(this, dt);
    }
};
DomContentHandler.prototype.startEntity = function(name) {};


// INTERFACE: EntityResolver: http://www.saxproject.org/apidoc/org/xml/sax/EntityResolver.html
// Could implement this by checking for last two arguments missing in EntityResolver2 resolveEntity() below
// DomContentHandler.prototype.resolveEntity(publicId, systemId) {};

// INTERFACE: EntityResolver2: http://www.saxproject.org/apidoc/org/xml/sax/ext/EntityResolver2.html
DomContentHandler.prototype.resolveEntity = function(name, publicId, baseURI, systemId) {};
DomContentHandler.prototype.getExternalSubset = function(name, baseURI) {};

// INTERFACE: DTDHandler: http://www.saxproject.org/apidoc/org/xml/sax/DTDHandler.html
DomContentHandler.prototype.notationDecl = function (name, publicId, systemId) {};
DomContentHandler.prototype.unparsedEntityDecl = function (name, publicId, systemId, notationName) {};

// INTERFACE: ErrorHandler: http://www.saxproject.org/apidoc/org/xml/sax/ErrorHandler.html
DomContentHandler.prototype.warning = function(saxParseException) {
    this.saxParseExceptions.push(saxParseException);
};
DomContentHandler.prototype.error = function(saxParseException) {
    this.saxParseExceptions.push(saxParseException);
};
DomContentHandler.prototype.fatalError = function(saxParseException) {
    throw saxParseException;
};

// EXPORT
this.DomContentHandler = DomContentHandler;

}());

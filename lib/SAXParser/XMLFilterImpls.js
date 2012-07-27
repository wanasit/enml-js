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

(function () { // Begin namespace

/*
 XMLReader 	getParent()
          Get the parent reader.
 void 	setParent(XMLReader parent)
          Set the parent reader.
*/

// http://www.saxproject.org/apidoc/org/xml/sax/helpers/XMLFilterImpl.html
// Allows subclasses to override methods to filter input before reaching the parent's methods

function _implements (obj, arr) {
    for (var i = 0; i < arr.length; i++) {
        if (typeof obj[arr[i]] !== 'function') {
            return false;
        }
    }
    return true;
}

function XMLFilterImpl (parent) {
    if (parent) {
        if (!_implements(parent,
            ['getContentHandler', 'getDTDHandler', 'getEntityResolver', 'getErrorHandler', 'getFeature', 'getProperty',
            'parse', 'setContentHandler', 'setDTDHandler', 'setEntityResolver', 'setErrorHandler', 'setFeature', 'setProperty'])) {
            throw 'XMLFilterImpl must be given a parent which implements XMLReader';
        }
        this.parent = parent;
    }
    // If there is no parent and it is not set subsequently by setParent(), this class can only be used for event consuming
}

XMLFilterImpl.prototype.toString = function () {
    return "XMLFilterImpl";
};

// INTERFACE: XMLFilter: http://www.saxproject.org/apidoc/org/xml/sax/XMLFilter.html
XMLFilterImpl.prototype.setParent = function (parent) { // e.g., SAXParser
    this.parent = parent;
};
XMLFilterImpl.prototype.getParent = function () {
    return this.parent;
};
// INTERFACE: XMLReader: http://www.saxproject.org/apidoc/org/xml/sax/XMLReader.html
XMLFilterImpl.prototype.getContentHandler = function () {
    return this.parent.getContentHandler.call(this.parent);
};
XMLFilterImpl.prototype.getDTDHandler = function () {
    return this.parent.getDTDHandler.call(this.parent);
};
XMLFilterImpl.prototype.getEntityResolver = function () {
    return this.parent.getEntityResolver.call(this.parent);
};
XMLFilterImpl.prototype.getErrorHandler = function () {
    return this.parent.getErrorHandler.call(this.parent);
};
XMLFilterImpl.prototype.getFeature = function (name) { // (java.lang.String)
    return this.parent.getFeature.call(this.parent, name);
};
XMLFilterImpl.prototype.getProperty = function (name) { // (java.lang.String)
    return this.parent.getProperty.call(this.parent, name);
};
XMLFilterImpl.prototype.parse = function (inputOrSystemId) { // (InputSource input OR java.lang.String systemId)
    return this.parent.parse.call(this.parent, inputOrSystemId);
};
XMLFilterImpl.prototype.setContentHandler = function (handler) { // (ContentHandler)
    return this.parent.setContentHandler.call(this.parent, handler);
};
XMLFilterImpl.prototype.setDTDHandler = function (handler) { // (DTDHandler)
    return this.parent.setDTDHandler.call(this.parent, handler);
};
XMLFilterImpl.prototype.setEntityResolver = function (resolver) { // (EntityResolver)
    return this.parent.setEntityResolver.call(this.parent, resolver);
};
XMLFilterImpl.prototype.setErrorHandler = function (handler) { // (ErrorHandler)
    return this.parent.setErrorHandler.call(this.parent, handler);
};
XMLFilterImpl.prototype.setFeature = function (name, value) { // (java.lang.String, boolean)
    return this.parent.setFeature.call(this.parent, name, value);
};
XMLFilterImpl.prototype.setProperty = function (name, value) { // (java.lang.String, java.lang.Object)
    return this.parent.setProperty.call(this.parent, name, value);
};
// END SAX2 XMLReader INTERFACE

// INTERFACE: ContentHandler: http://www.saxproject.org/apidoc/org/xml/sax/ContentHandler.html
XMLFilterImpl.prototype.startDocument = function() {
    return this.parent ? this.parent.contentHandler.startDocument.call(this.parent.contentHandler) : undefined;
};

XMLFilterImpl.prototype.startElement = function(namespaceURI, localName, qName, atts) {
    return this.parent ? this.parent.contentHandler.startElement.call(this.parent.contentHandler, namespaceURI, localName, qName, atts) : undefined;
};

XMLFilterImpl.prototype.endElement = function(namespaceURI, localName, qName) {
    return this.parent ? this.parent.contentHandler.endElement.call(this.parent.contentHandler, namespaceURI, localName, qName) : undefined;
};

XMLFilterImpl.prototype.startPrefixMapping = function(prefix, uri) {
    return this.parent ? this.parent.contentHandler.startPrefixMapping.call(this.parent.contentHandler, prefix, uri) : undefined;
};

XMLFilterImpl.prototype.endPrefixMapping = function(prefix) {
    return this.parent ? this.parent.contentHandler.endPrefixMapping.call(this.parent.contentHandler, prefix) : undefined;
};

XMLFilterImpl.prototype.processingInstruction = function(target, data) {
    return this.parent ? this.parent.contentHandler.processingInstruction.call(this.parent.contentHandler, target, data) : undefined;
};

XMLFilterImpl.prototype.ignorableWhitespace = function(ch, start, length) {
    return this.parent ? this.parent.contentHandler.ignorableWhitespace.call(this.parent.contentHandler, ch, start, length) : undefined;
};

XMLFilterImpl.prototype.characters = function(ch, start, length) {
    return this.parent ? this.parent.contentHandler.characters.call(this.parent.contentHandler, ch, start, length) : undefined;
};

XMLFilterImpl.prototype.skippedEntity = function(name) {
    return this.parent ? this.parent.contentHandler.skippedEntity.call(this.parent.contentHandler, name) : undefined;
};

XMLFilterImpl.prototype.endDocument = function() {
    return this.parent ? this.parent.contentHandler.endDocument.call(this.parent.contentHandler) : undefined;
};

XMLFilterImpl.prototype.setDocumentLocator = function (locator) {
    return this.parent ? this.parent.contentHandler.setDocumentLocator.call(this.parent.contentHandler, locator) : undefined;
};
// INTERFACE: EntityResolver: http://www.saxproject.org/apidoc/org/xml/sax/EntityResolver.html
// Could implement this by checking for last two arguments missing in EntityResolver2 resolveEntity() below
XMLFilterImpl.prototype.resolveEntity = function (publicId, systemId) {
    if (this.parent && this.parent.entityResolver) {
        return this.parent.entityResolver.resolveEntity.call(this.parent.entityResolver, publicId, systemId);
    }
    return undefined;
};

// INTERFACE: DTDHandler: http://www.saxproject.org/apidoc/org/xml/sax/DTDHandler.html
XMLFilterImpl.prototype.notationDecl = function (name, publicId, systemId) {
    if (this.parent && this.parent.dtdHandler && this.parent.dtdHandler.notationDecl) {
        return this.parent.dtdHandler.notationDecl.call(this.parent.dtdHandler, name, publicId, systemId);
    }
    return undefined;
};
XMLFilterImpl.prototype.unparsedEntityDecl = function (name, publicId, systemId, notationName) {
    if (this.parent && this.parent.dtdHandler && this.parent.dtdHandler.unparsedEntityDecl) {
        return this.parent.dtdHandler.unparsedEntityDecl.call(this.parent.dtdHandler, name, publicId, systemId, notationName);
    }
    return undefined;
};

// INTERFACE: ErrorHandler: http://www.saxproject.org/apidoc/org/xml/sax/ErrorHandler.html
XMLFilterImpl.prototype.warning = function(saxParseException) {
    if (this.parent && this.parent.errorHandler) {
        return this.parent.errorHandler.warning.call(this.parent.errorHandler, saxParseException);
    }
    return undefined;
};
XMLFilterImpl.prototype.error = function(saxParseException) {
    if (this.parent && this.parent.errorHandler) {
        return this.parent.errorHandler.error.call(this.parent.errorHandler, saxParseException);
    }
    return undefined;
};
XMLFilterImpl.prototype.fatalError = function(saxParseException) {
    if (this.parent && this.parent.errorHandler) {
        return this.parent.errorHandler.fatalError.call(this.parent.errorHandler, saxParseException);
    }
    return undefined;
};


// BEGIN CUSTOM API (could make all but parseString() private)
// The following is not really a part of XMLFilterImpl but we are effectively depending on it
XMLFilterImpl.prototype.parseString = function(xml) {
    return this.parent.parseString.call(this.parent, xml);
};


// There is no XMLFilterImpl2 part of SAX2, but we add one to add the remaining interfaces covered in DefaultHandler2 but not
//  in XMLFilterImpl: DeclHandler, EntityResolver2, LexicalHandler

function XMLFilterImpl2 (parent) {
    // If there is no parent and it is not set subsequently by setParent(), this class can only be used for event consuming
    return XMLFilterImpl.call(this, parent);
}
XMLFilterImpl2.prototype = new XMLFilterImpl();

XMLFilterImpl2.prototype.toString = function () {
    return "XMLFilterImpl2";
};

// INTERFACE: DeclHandler: http://www.saxproject.org/apidoc/org/xml/sax/ext/DeclHandler.html

XMLFilterImpl2.prototype.attributeDecl = function(eName, aName, type, mode, value) {
    if (this.parent && this.parent.declarationHandler && this.parent.declarationHandler.attributeDecl) {
        return this.parent.declarationHandler.attributeDecl.call(this.parent.declarationHandler, eName, aName, type, mode, value);
    }
    return undefined;
};

XMLFilterImpl2.prototype.elementDecl = function(name, model) {
    if (this.parent && this.parent.declarationHandler && this.parent.declarationHandler.elementDecl) {
        return this.parent.declarationHandler.elementDecl.call(this.parent.declarationHandler,  name, model);
    }
    return undefined;
};

XMLFilterImpl2.prototype.externalEntityDecl = function(name, publicId, systemId) {
    if (this.parent && this.parent.declarationHandler && this.parent.declarationHandler.externalEntityDecl) {
        return this.parent.declarationHandler.externalEntityDecl.call(this.parent.declarationHandler,  name, publicId, systemId);
    }
    return undefined;
};

XMLFilterImpl2.prototype.internalEntityDecl = function(name, value) {
    if (this.parent && this.parent.declarationHandler && this.parent.declarationHandler.internalEntityDecl) {
        return this.parent.declarationHandler.internalEntityDecl.call(this.parent.declarationHandler,  name, value);
    }
    return undefined;
};

// INTERFACE: LexicalHandler: http://www.saxproject.org/apidoc/org/xml/sax/ext/LexicalHandler.html

XMLFilterImpl2.prototype.comment = function(ch, start, length) {
    if (this.parent && this.parent.lexicalHandler && this.parent.lexicalHandler.comment) {
        return this.parent.lexicalHandler.comment.call(this.parent.lexicalHandler,  ch, start, length);
    }
    return undefined;
};

XMLFilterImpl2.prototype.endCDATA = function() {
    if (this.parent && this.parent.lexicalHandler && this.parent.lexicalHandler.endCDATA) {
        return this.parent.lexicalHandler.endCDATA.call(this.parent.lexicalHandler);
    }
    return undefined;
};

XMLFilterImpl2.prototype.endDTD = function() {
    if (this.parent && this.parent.lexicalHandler && this.parent.lexicalHandler.endDTD) {
        return this.parent.lexicalHandler.endDTD.call(this.parent.lexicalHandler);
    }
    return undefined;
};

XMLFilterImpl2.prototype.endEntity = function(name) {
    if (this.parent && this.parent.lexicalHandler && this.parent.lexicalHandler.endEntity) {
        return this.parent.lexicalHandler.endEntity.call(this.parent.lexicalHandler, name);
    }
    return undefined;
};

XMLFilterImpl2.prototype.startCDATA = function() {
    if (this.parent && this.parent.lexicalHandler && this.parent.lexicalHandler.startCDATA) {
        return this.parent.lexicalHandler.startCDATA.call(this.parent.lexicalHandler);
    }
    return undefined;
};

XMLFilterImpl2.prototype.startDTD = function(name, publicId, systemId) {
    if (this.parent && this.parent.lexicalHandler && this.parent.lexicalHandler.startDTD) {
        return this.parent.lexicalHandler.startDTD.call(this.parent.lexicalHandler, name, publicId, systemId);
    }
    return undefined;
};

XMLFilterImpl2.prototype.startEntity = function(name) {
    if (this.parent && this.parent.lexicalHandler && this.parent.lexicalHandler.startEntity) {
        return this.parent.lexicalHandler.startEntity.call(this.parent.lexicalHandler, name);
    }
    return undefined;
};
XMLFilterImpl2.prototype.startCharacterReference = function(hex, number) {
    if (this.parent && this.parent.lexicalHandler && this.parent.lexicalHandler.startCharacterReference) {
        return this.parent.lexicalHandler.startCharacterReference.call(this.parent.lexicalHandler, hex, number);
    }
    return undefined;
};

// INTERFACE: EntityResolver: http://www.saxproject.org/apidoc/org/xml/sax/EntityResolver.html
// Could implement this by checking for last two arguments missing in EntityResolver2 resolveEntity() below
// XMLFilterImpl2.prototype.resolveEntity = function (publicId, systemId) {};
// INTERFACE: EntityResolver2: http://www.saxproject.org/apidoc/org/xml/sax/ext/EntityResolver2.html
XMLFilterImpl2.prototype.resolveEntity = function(name, publicId, baseURI, systemId) {
    if (this.parent && this.parent.entityResolver && this.parent.entityResolver.resolveEntity) {
        return this.parent.entityResolver.resolveEntity.call(this.parent.entityResolver, name, publicId, baseURI, systemId);
    }
    return undefined;
};
XMLFilterImpl2.prototype.getExternalSubset = function(name, baseURI) {
    if (this.parent && this.parent.entityResolver && this.parent.entityResolver.getExternalSubset) {
        return this.parent.entityResolver.getExternalSubset.call(this.parent.entityResolver, name, baseURI);
    }
    return undefined;
};

// Could put on org.xml.sax.helpers.
this.XMLFilterImpl = XMLFilterImpl;
this.XMLFilterImpl2 = XMLFilterImpl2;

}()); // end namespace

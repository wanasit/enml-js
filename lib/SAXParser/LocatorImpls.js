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

(function () { // Begin namespace

/* Supporting classes  */
// NOT USED YET (Sax class should set, though only use Locator2 API if http://xml.org/sax/features/use-locator2 feature is set on the parser)

/*
public LocatorImpl()
    Zero-argument constructor.
        This will not normally be useful, since the main purpose of this class is to make a snapshot of an existing Locator.
public LocatorImpl(Locator locator)
    Copy constructor.
        Create a persistent copy of the current state of a locator. When the original locator changes, this copy will still keep the original values (and it can be used outside the scope of DocumentHandler methods).
Parameters:
    locator - The locator to copy.
*/
function LocatorImpl (locator) {
    if (locator) {
        var properties = ['columnNumber', 'lineNumber', 'publicId', 'systemId'];
        for (var i=0; i < properties.length; i++) {
            this[properties[i]] = locator[properties[i]];
        }
    }
}
// INTERFACE: Locator: http://www.saxproject.org/apidoc/org/xml/sax/Locator.html
/*
 int 	getColumnNumber()
          Return the column number where the current document event ends.
 int 	getLineNumber()
          Return the line number where the current document event ends.
 java.lang.String 	getPublicId()
          Return the public identifier for the current document event.
 java.lang.String 	getSystemId()
          Return the system identifier for the current document event.
*/
LocatorImpl.prototype.getColumnNumber = function () {
    return this.columnNumber;
};
LocatorImpl.prototype.getLineNumber = function () {
    return this.lineNumber;
};
LocatorImpl.prototype.getPublicId = function () {
    return this.publicId;
};
LocatorImpl.prototype.getSystemId = function () {
    return this.systemId;
};

/* From Java API (not an interface, but useful part of class) */
/*
  void 	setColumnNumber(int columnNumber)
          Set the column number for this locator (1-based).
 void 	setLineNumber(int lineNumber)
          Set the line number for this locator (1-based).
 void 	setPublicId(java.lang.String publicId)
          Set the public identifier for this locator.
 void 	setSystemId(java.lang.String systemId)
          Set the system identifier for this locator.
 **/
LocatorImpl.prototype.setColumnNumber = function (columnNumber) {
    this.columnNumber = columnNumber;
};
LocatorImpl.prototype.setLineNumber = function (lineNumber) {
    this.lineNumber = lineNumber;
};
LocatorImpl.prototype.setPublicId = function (publicId) {
    this.publicId = publicId;
};
LocatorImpl.prototype.setSystemId = function (systemId) {
    this.systemId = systemId;
};

/*
public Locator2Impl()
    Construct a new, empty Locator2Impl object. This will not normally be useful, since the main purpose of this class is to make a snapshot of an existing Locator.
public Locator2Impl(Locator locator)
    Copy an existing Locator or Locator2 object. If the object implements Locator2, values of the encoding and versionstrings are copied, otherwise they set to null.
Parameters:
    locator - The existing Locator object.
 **/
function Locator2Impl (locator) {
    if (locator) {
        LocatorImpl.call(this, locator); // 'columnNumber', 'lineNumber', 'publicId', 'systemId'
        var properties = ['encoding', 'version'];
        for (var i=0; i < properties.length; i++) {
            this[properties[i]] = locator[properties[i]];
        }
    }
}
Locator2Impl.prototype = new LocatorImpl();
/* INTERFACE: Locator2: http://www.saxproject.org/apidoc/org/xml/sax/ext/Locator2.html
  java.lang.String 	getEncoding()
          Returns the name of the character encoding for the entity.
 java.lang.String 	getXMLVersion()
          Returns the version of XML used for the entity.
 **/
Locator2Impl.prototype.getEncoding = function () {
    return this.encoding;
};
Locator2Impl.prototype.getXMLVersion = function () {
    return this.version;
};

/* From Java API (not an interface, but useful part of class) */
/*
 void 	setEncoding(java.lang.String encoding)
          Assigns the current value of the encoding property.
 void 	setXMLVersion(java.lang.String version)
          Assigns the current value of the version property.
 **/
Locator2Impl.prototype.setEncoding = function (encoding) {
    this.encoding = encoding;
    // A DOM version cannot set the xmlEncoding property on the document in the contentHandler as it is read-only
};
Locator2Impl.prototype.setXMLVersion = function (version) {
    this.version = version;
    // A DOM version may wish to set the xmlVersion property on the document in the contentHandler (could use getContentHandler())
    // the standAlone property on the contentHandler document (also related to the XML Declaration) may be set after determining the value from a call to the contentHandler's getFeature('http://xml.org/sax/features/is-standalone')
};


// Could put on org.xml.sax.helpers.
this.LocatorImpl = LocatorImpl;

// Could put on org.xml.sax.ext.
this.Locator2Impl = Locator2Impl;

}()); // end namespace
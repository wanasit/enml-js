// http://java.sun.com/j2se/1.4.2/docs/api/org/xml/sax/InputSource.html
// Could put in org.xml.sax namespace

// For convenience, when dealing with raw strings as input, one can simply use own parseString() instead of
// XMLReader's parse() which expects an InputSouce (or
// systemId (file URL)); note that resolveEntity() on EntityResolver and also getExternalSubset() on EntityResolver2 return
// an InputSource and Locator and Locator2 also have notes on InputSource

function InputSource(input) {
    if (!input) {
        return;
    }
    if (typeof input === 'string') {
        this.systemId = input;
    }
    else if (input instanceof InputStream) {
        this.byteStream = input;
    }
    else if (input instanceof Reader) { // Should not have a byte-order mark
        this.characterStream = input;
    }
}
InputSource.prototype.getByteStream = function () {
    return this.byteStream || null; // InputStream
};
InputSource.prototype.getCharacterStream = function () { // Should apparently not have a byte-order mark (see constructor)
    return this.characterStream || null; // Reader
};
InputSource.prototype.getEncoding = function () {
    return this.encoding || null; // String
};
InputSource.prototype.getPublicId = function () {
    return this.publicId || null; // String
};
InputSource.prototype.getSystemId = function () {
    return this.systemId || null; // String
};
InputSource.prototype.setByteStream = function (byteStream) { // InputStream
    this.byteStream = byteStream;
};
InputSource.prototype.setCharacterStream = function (characterStream) { // Reader
    this.characterStream = characterStream;
};
InputSource.prototype.setEncoding = function (encoding) { // No effect on character stream
    this.encoding = encoding;
};
InputSource.prototype.setPublicId = function (publicId) { // String
    this.publicId = publicId;
};
InputSource.prototype.setSystemId = function (systemId) { // String
    this.systemId = systemId;
};

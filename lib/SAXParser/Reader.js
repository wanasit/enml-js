// http://java.sun.com/j2se/1.4.2/docs/api/java/io/Reader.html
// Note: Can't put into "java.io" namespace since "java" is reserved for LiveConnect
// Note: The class is not fully implemented
function Reader (lock) {
    if (lock) { // If this argument is passed, it should be an Object (critical sections will synchronize on the given object;
                         // otherwise will be on the Reader itself)
        this.lock = lock; // "lock" is a field of the class
    }
}
Reader.prototype.close = function () {
    throw 'The Reader close() method is abstract';
};
Reader.prototype.mark = function (readAheadLimit) { // int

};
Reader.prototype.markSupported = function () {

};
Reader.prototype.read = function (cbuf, off, len) { // (char[] (, int, int))
    if (arguments.length > 4 || arguments.length === 2) {
        throw "Reader's read() method expects 0, 1, or 3 arguments";
    }
    if (!cbuf) {
        
    }
    if (!off) {
        
    }
    throw 'The Reader read() method with 3 arguments (char[], int, and int) is abstract.';
};
Reader.prototype.ready = function () {

};
Reader.prototype.reset = function () {

};
Reader.prototype.skip = function (n) { // long

};

// http://java.sun.com/j2se/1.4.2/docs/api/java/io/StringReader.html
// Note: Can't put into "java.io" namespace since "java" is reserved for LiveConnect
// Note: The class is not fully implemented

function StringReader (s) { // String
    this.s = s; // Not part of the interface nor formally a part of the class
    this.nextIdx = 0;
    this.markIdx = 0;
    this.length = s.length;
}
StringReader.prototype = new Reader(); // Effectively overrides all methods, however (and lock field has to be redefined anyways)
StringReader.prototype.constructor = StringReader;
StringReader.prototype.close = function () {
};
StringReader.prototype.mark = function (readAheadLimit) { // int not supported for StringReader
    this.markIdx = this.nextIdx;
};
StringReader.prototype.markSupported = function () {
    return true;
};
StringReader.prototype.read = function (cbuf, off, len) { // (char[] (, int, int))
    if (arguments.length === 0) {
        if (this.nextIdx >= this.length) {
             throw new EndOfInputException();
        }
        var ch = this.s.charAt(this.nextIdx);
        this.nextIdx++;
        return ch;
    }
    if (arguments.length === 1) {
        cbuf = this.s.substr(this.nextIdx);
        this.nextIdx = this.length;
        return cbuf;
    }
    this.nextIdx += off;
    if (this.nextIdx >= this.length) {
        throw new EndOfInputException();
    }
    //do not throw endOfInputException here, it can be just a test
    cbuf = this.s.substr(this.nextIdx, len);
    this.nextIdx += len;
    return cbuf;
};
StringReader.prototype.ready = function () {
    return true;
};
StringReader.prototype.reset = function () {
    this.nextIdx = this.markIdx;
};
StringReader.prototype.skip = function (n) { // long
    this.nextIdx += n;
    return n;
};


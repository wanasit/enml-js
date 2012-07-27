/*
Copyright or © or Copr. Nicolas Debeissat

nicolas.debeissat@gmail.com (http://debeissat.nicolas.free.fr/)

This software is a computer program whose purpose is to validate XML
against a RelaxNG schema.

This software is governed by the CeCILL license under French law and
abiding by the rules of distribution of free software.  You can  use, 
modify and/ or redistribute the software under the terms of the CeCILL
license as circulated by CEA, CNRS and INRIA at the following URL
"http://www.cecill.info". 

As a counterpart to the access to the source code and  rights to copy,
modify and redistribute granted by the license, users are provided only
with a limited warranty  and the software's author,  the holder of the
economic rights,  and the successive licensors  have only  limited
liability. 

In this respect, the user's attention is drawn to the risks associated
with loading,  using,  modifying and/or developing or reproducing the
software by the user in light of its specific status of free software,
that may mean  that it is complicated to manipulate,  and  that  also
therefore means  that it is reserved for developers  and  experienced
professionals having in-depth computer knowledge. Users are therefore
encouraged to load and test the software's suitability as regards their
requirements in conditions enabling the security of their systems and/or 
data to be ensured and,  more generally, to use and operate it in the 
same conditions as regards security. 

The fact that you are presently reading this means that you have had
knowledge of the CeCILL license and that you accept its terms.

*/

/*
that is the implementation of the following algorithm : http://www.thaiopensource.com/relaxng/derivative.html
*/

/*
First, we define the datatypes we will be using. URIs and local names are just strings.

type Uri = String

type LocalName = String

A ParamList represents a list of parameters; each parameter is a pair consisting of a local name and a value.

type ParamList = [(LocalName, String)]

A Context represents the context of an XML element. It consists of a base URI and a mapping from prefixes to namespace URIs.

type Prefix = String

type Context = (Uri, [(Prefix, Uri)])

A Datatype identifies a datatype by a datatype library name and a local name.

type Datatype = (Uri, LocalName)

A NameClass represents a name class.

data NameClass = AnyName
                 | AnyNameExcept NameClass
                 | Name Uri LocalName
                 | NsName Uri
                 | NsNameExcept Uri NameClass
                 | NameClassChoice NameClass NameClass

A Pattern represents a pattern after simplification.

data Pattern = Empty
               | NotAllowed
               | Text
               | Choice Pattern Pattern
               | Interleave Pattern Pattern
               | Group Pattern Pattern
               | OneOrMore Pattern
               | List Pattern
               | Data Datatype ParamList
               | DataExcept Datatype ParamList Pattern
               | Value Datatype String Context
               | Attribute NameClass Pattern
               | Element NameClass Pattern
               | After Pattern Pattern
		
The After pattern is used internally and will be explained later.

Note that there is an Element pattern rather than a Ref pattern. In the simplified XML representation of patterns, every ref element refers to an element pattern. In the internal representation of patterns, we can replace each reference to a ref pattern by a reference to the element pattern that the ref pattern references, resulting in a cyclic data structure. (Note that even though Haskell is purely functional it can handle cyclic data structures because of its laziness.)

In the instance, elements and attributes are labelled with QNames; a QName is a URI/local name pair.

data QName = QName Uri LocalName

An XML document is represented as a ChildNode. There are two kinds of child node:

    * a TextNode containing a string;
    * an ElementNode containing a name (of type QName), a Context, a set of attributes (represented as a list of AttributeNodes, each of which will be an AttributeNode), and a list of children (represented as a list of ChildNodes).

data ChildNode = ElementNode QName Context [AttributeNode] [ChildNode]
                 | TextNode String

An AttributeNode consists of a QName and a String.

data AttributeNode = AttributeNode QName String
*/

function Param(localName, string) {
    this.localName = localName;
    this.string = string;
}
Param.prototype.toHTML = function() {
    return "<table><tr><th>Param</th></tr><tr><td>localName</td><td>" + this.localName + "</td></tr><tr><td>string</td><td>" + this.string + "</td></tr></table>";
};
Param.prototype.toString = function() {
    return "Param";
};

/*
map is an array of [(Prefix, Uri)] mappings
*/
function Context(uri, map) {
    this.uri = uri;
    this.map = map;
}
Context.prototype.toHTML = function() {
    var string = "<table><tr><th>Context</th></tr><tr><td>uri</td><td>" + this.uri + "</td></tr><tr><td><table><tr><th>map</th></tr>";
    for (var i in this.map) {
        string += "<tr><td>" + i + "</td><td>" + this.map[i] + "</td></tr>";
    }
    return string + "</table></td></tr></table>";
};
Context.prototype.toString = function() {
    return "Context";
};

function Datatype(uri, localName) {
    this.uri = uri;
    this.localName = localName;
}
Datatype.prototype.toHTML = function() {
    return "<table><tr><th>Datatype</th></tr><tr><td>uri</td><td>" + this.uri + "</td></tr><tr><td>localName</td><td>" + this.localName + "</td></tr></table>";
};
Datatype.prototype.toString = function() {
    return "Datatype";
};

/*
data NameClass = AnyName
                 | AnyNameExcept NameClass
                 | Name Uri LocalName
                 | NsName Uri
                 | NsNameExcept Uri NameClass
                 | NameClassChoice NameClass NameClass
*/
function AnyName() {}
AnyName.prototype.toHTML = function() {
    return "<table><tr><th>AnyName</th></tr></table>";
};
AnyName.prototype.toString = function() {
    return "AnyName";
};

function AnyNameExcept(nameClass) {
    this.nameClass = nameClass;
}
AnyNameExcept.prototype.toHTML = function() {
    return "AnyNameExcept";
};
AnyNameExcept.prototype.toString = function() {
    return "AnyNameExcept";
};

function Name(uri, localName) {
    this.uri = uri;
    this.localName = localName;
}
Name.prototype.toHTML = function() {
    return "<table><tr><th>Name</th></tr><tr><td>uri</td><td>" + this.uri + "</td></tr><tr><td>localName</td><td>" + this.localName + "</td></tr></table>";
};
Name.prototype.toString = function() {
    return "Name";
};

function NsName(uri) {
    this.uri = uri;
}
NsName.prototype.toHTML = function() {
    return "<table><tr><th>NsName</th></tr><tr><td>uri</td><td>" + this.uri + "</td></tr></table>";
};
NsName.prototype.toString = function() {
    return "NsName";
};
function NsNameExcept(uri, nameClass) {
    this.uri = uri;
    this.nameClass = nameClass;
}
NsNameExcept.prototype.toHTML = function() {
    return "<table><tr><th>NsNameExcept</th></tr><tr><td>uri</td><td>" + this.uri + "</td></tr><tr><td>nameClass</td><td>" + this.nameClass.toHTML() + "</td></tr></table>";
};
NsNameExcept.prototype.toString = function() {
    return "NsNameExcept";
};

function NameClassChoice(nameClass1, nameClass2) {
    this.nameClass1 = nameClass1;
    this.nameClass2 = nameClass2;
}
NameClassChoice.prototype.toHTML = function() {
    return "<table><tr><th>NameClassChoice</th></tr><tr><td>nameClass1</td><td>" + this.nameClass1.toHTML() + "</td></tr><tr><td>nameClass2</td><td>" + this.nameClass2.toHTML() + "</td></tr></table>";
};
NameClassChoice.prototype.toString = function() {
    return "NameClassChoice";
};


/*
data Pattern = Empty
               | NotAllowed
               | Text
               | Choice Pattern Pattern
               | Interleave Pattern Pattern
               | Group Pattern Pattern
               | OneOrMore Pattern
               | List Pattern
               | Data Datatype ParamList
               | DataExcept Datatype ParamList Pattern
               | Value Datatype String Context
               | Attribute NameClass Pattern
               | Element NameClass Pattern
               | After Pattern Pattern
*/
function Empty() {}
Empty.prototype.toHTML = function() {
    return "<table><tr><th>Empty</th></tr></table>";
};
Empty.prototype.toString = function() {
    return "Empty";
};

/*
priority gives a rank of pertinence between NotAllowed message
*/
function NotAllowed(message, pattern, childNode, priority) {
    this.message = message;
    this.pattern = pattern;
    this.childNode = childNode;
    this.priority = priority;
}
NotAllowed.prototype.toHTML = function() {
    var string = "<table><tr><th>NotAllowed</th></tr><tr><td>message</td><td>" + this.message + "</td></tr><tr><td>pattern</td><td>" + this.pattern.toHTML() + "</td></tr><tr><td>childNode</td><td>";
    //childNode may be a string directly
    if (this.childNode.toHTML) {
        string += this.childNode.toHTML();
    } else {
        string += this.childNode;
    }
    return string + "</td></tr></table>";
};
NotAllowed.prototype.toString = function() {
    return "NotAllowed";
};

function MissingContent(message, pattern, childNode, priority) {
    this.message = message;
    this.pattern = pattern;
    this.childNode = childNode;
    this.priority = priority;
}
MissingContent.prototype = new NotAllowed();
MissingContent.constructor = NotAllowed;
MissingContent.prototype.toHTML = function() {
    var string = "<table><tr><th>MissingContent</th></tr><tr><td>message</td><td>" + this.message + "</td></tr><tr><td>pattern</td><td>" + this.pattern.toHTML() + "</td></tr><tr><td>childNode</td><td>";
    //childNode may be a string directly
    if (this.childNode.toHTML) {
        string += this.childNode.toHTML();
    } else {
        string += this.childNode;
    }
    return string + "</td></tr></table>";
};
MissingContent.prototype.toString = function() {
    return "MissingContent";
};

function Text() {}
Text.prototype.toHTML = function() {
    return "<table><tr><th>Text</th></tr></table>";
};
Text.prototype.toString = function() {
    return "Text";
};

function Choice(pattern1, pattern2) {
    this.pattern1 = pattern1;
    this.pattern2 = pattern2;
}
Choice.prototype.toHTML = function() {
    return "<table><tr><th>Choice</th></tr><tr><td>pattern1</td><td>" + this.pattern1.toHTML() + "</td></tr><tr><td>pattern2</td><td>" + this.pattern2.toHTML() + "</td></tr></table>";
};
Choice.prototype.toString = function() {
    return "Choice";
};

function Interleave(pattern1, pattern2) {
    this.pattern1 = pattern1;
    this.pattern2 = pattern2;
}
Interleave.prototype.toHTML = function() {
    return "<table><tr><th>Interleave</th></tr><tr><td>pattern1</td><td>" + this.pattern1.toHTML() + "</td></tr><tr><td>pattern2</td><td>" + this.pattern2.toHTML() + "</td></tr></table>";
};
Interleave.prototype.toString = function() {
    return "Interleave";
};

function Group(pattern1, pattern2) {
    this.pattern1 = pattern1;
    this.pattern2 = pattern2;
}
Group.prototype.toHTML = function() {
    return "<table><tr><th>Group</th></tr><tr><td>pattern1</td><td>" + this.pattern1.toHTML() + "</td></tr><tr><td>pattern2</td><td>" + this.pattern2.toHTML() + "</td></tr></table>";
};
Group.prototype.toString = function() {
    return "Group";
};

function OneOrMore(pattern) {
    this.pattern = pattern;
}
OneOrMore.prototype.toHTML = function() {
    return "<table><tr><th>OneOrMore</th></tr><tr><td>pattern</td><td>" + this.pattern.toHTML() + "</td></tr></table>";
};
OneOrMore.prototype.toString = function() {
    return "OneOrMore";
};

function List(pattern) {
    this.pattern = pattern;
}
List.prototype.toHTML = function() {
    return "<table><tr><th>List</th></tr><tr><td>pattern</td><td>" + this.pattern.toHTML() + "</td></tr></table>";
};
List.prototype.toString = function() {
    return "List";
};

function Data(datatype, paramList) {
    this.datatype = datatype;
    this.paramList = paramList;
}
Data.prototype.toHTML = function() {
    var string = "<table><tr><th>Data</th></tr><tr><td>datatype</td><td>" + this.datatype.toHTML() + "</td></tr><tr><td><table><tr><th>paramList</th></tr>"
    var i = this.paramList.length;
    while (i--) {
        string += "<tr><td>" + this.paramList[i].toHTML() + "</td></tr>";
    }
    return string + "</table></td></tr></table>";
};
Data.prototype.toString = function() {
    return "Data";
};

function DataExcept(datatype, paramList, pattern) {
    this.datatype = datatype;
    this.paramList = paramList;
    this.pattern = pattern;
}
DataExcept.prototype.toHTML = function() {
    var string = "<table><tr><th>DataExcept</th></tr><tr><td>datatype</td><td>" + this.datatype.toHTML() + "</td></tr><tr><td><table><tr><th>paramList</th></tr>"
    var i = this.paramList.length;
    while (i--) {
        string += "<tr><td>" + this.paramList[i].toHTML() + "</td></tr>";
    }
    return string + "</table></td></tr><tr><td>pattern</td><td>" + this.pattern.toHTML() + "</td></tr></table>";
};
DataExcept.prototype.toString = function() {
    return "DataExcept";
};

function Value(datatype, string, context) {
    this.datatype = datatype;
    this.string = string;
    this.context = context;
}
Value.prototype.toHTML = function() {
    return "<table><tr><th>Data</th></tr><tr><td>datatype</td><td>" + this.datatype.toHTML() + "</td></tr><tr><td>string</td><td>" + this.string + "</td></tr><tr><td>context</td><td>" + this.context.toHTML() + "</td></tr></table>";
};
Value.prototype.toString = function() {
    return "Value";
};

/*
defaultValue must be an instance of Value
*/
function Attribute(nameClass, pattern, defaultValue) {
    this.nameClass = nameClass;
    this.pattern = pattern;
    this.defaultValue = defaultValue;
}
Attribute.prototype.toHTML = function() {
    var string = "<table><tr><th>Attribute</th></tr><tr><td>nameClass</td><td>" + this.nameClass.toHTML() + "</td></tr><tr><td>pattern</td><td>" + this.pattern.toHTML() + "</td></tr></table>";
    if (this.defaultValue) {
        string += "</td></tr><tr><td>defaultValue</td><td>" + this.defaultValue.toHTML();
    }
    return string + "</td></tr></table>";
};
Attribute.prototype.toString = function() {
    return "Attribute";
};

function Element(nameClass, pattern) {
    this.nameClass = nameClass;
    this.pattern = pattern;
}
Element.prototype.toHTML = function() {
    return "<table><tr><th>Element</th></tr><tr><td>nameClass</td><td>" + this.nameClass.toHTML() + "</td></tr><tr><td>pattern</td><td>" + this.pattern.toHTML() + "</td></tr></table>";
};
Element.prototype.toString = function() {
    return "Element";
};

function After(pattern1, pattern2) {
    this.pattern1 = pattern1;
    this.pattern2 = pattern2;
}
After.prototype.toHTML = function() {
    return "<table><tr><th>After</th></tr><tr><td>pattern1</td><td>" + this.pattern1.toHTML() + "</td></tr><tr><td>pattern2</td><td>" + this.pattern2.toHTML() + "</td></tr></table>";
};
After.prototype.toString = function() {
    return "After";
};


function QName(uri, localName) {
    this.uri = uri;
    this.localName = localName;
}
QName.prototype.toHTML = function() {
    return "<table><tr><th>QName</th></tr><tr><td>uri</td><td>" + this.uri + "</td></tr><tr><td>localName</td><td>" + this.localName + "</td></tr></table>";
};
QName.prototype.toString = function() {
    return "QName";
};

/*
data ChildNode = ElementNode QName Context [AttributeNode] [ChildNode]
                 | TextNode String
*/
function ElementNode(qName, context, attributeNodes, childNodes) {
    this.qName = qName;
    this.context = context;
    this.attributeNodes = attributeNodes;
    this.childNodes = childNodes;
}
ElementNode.prototype.setParentNode = function(parentNode) {
    this.parentNode = parentNode;
};
/*
used for augmenting the XML instance, by default does not do anything
*/
ElementNode.prototype.addAttribute = function(pattern) {};

ElementNode.prototype.toHTML = function() {
    var string = "<table><tr><th>ElementNode</th></tr><tr><td>qName</td><td>" + this.qName.toHTML() + "</td></tr><tr><td>context</td><td>" + this.context.toHTML() + "</td></tr><tr><td>attributeNodes</td><td><table>";
    for (var i in this.attributeNodes) {
        string += "<tr><td>" + this.attributeNodes[i].toHTML() + "</td></tr>";
    }
    string += "</table></td></tr><tr><td>childNodes</td><td><table>";
    for (var i = 0; i < this.childNodes.length; i++) {
        string += "<tr><td>" + this.childNodes[i].toHTML() + "</td></tr>";
    }
    string += "</table>";
    if (this.parentNode) {
        string += "</td></tr><tr><td>parentNode</td><td>" + this.parentNode.qName.localName;
    }
    return string + "</td></tr></table>";
};
ElementNode.prototype.toString = function() {
    return "ElementNode";
};

function TextNode(string) {
    this.string = string;
}
TextNode.prototype.toHTML = function() {
    return "<table><tr><th>TextNode</th></tr><tr><td>string</td><td>[" + this.string + "]</td></tr></table>";
};
TextNode.prototype.toString = function() {
    return "TextNode";
};

function AttributeNode(qName, string) {
    this.qName = qName;
    this.string = string;
}
/*
used for augmenting the XML instance, by default does not do anything
*/
AttributeNode.prototype.setType = function(type) {};
AttributeNode.prototype.toHTML = function() {
    return "<table><tr><th>AttributeNode</th></tr><tr><td>qName</td><td>" + this.qName.toHTML() + "</td></tr><tr><td>string</td><td>" + this.string + "</td></tr></table>";
};
AttributeNode.prototype.toString = function() {
    return "AttributeNode";
};

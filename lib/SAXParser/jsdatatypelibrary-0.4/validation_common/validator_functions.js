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
function ValidatorFunctions(relaxNGValidator, datatypeLibrary) {
    this.relaxNGValidator = relaxNGValidator;
    this.datatypeLibrary = datatypeLibrary;
}

ValidatorFunctions.prototype.debug = function(message, pattern, childNode) {
    if (this.relaxNGValidator.debug) {
        recordStep(message, pattern, childNode);
    }
};
    
    
    /*
    contains :: NameClass -> QName -> Bool
    contains AnyName _ = True
    contains (AnyNameExcept nc) n = not (contains nc n)
    contains (NsName ns1) (QName ns2 _) = (ns1 == ns2)
    contains (NsNameExcept ns1 nc) (QName ns2 ln) = ns1 == ns2 && not (contains nc (QName ns2 ln))
    contains (Name ns1 ln1) (QName ns2 ln2) = (ns1 == ns2) && (ln1 == ln2)
    contains (NameClassChoice nc1 nc2) n = (contains nc1 n) || (contains nc2 n)
    */
ValidatorFunctions.prototype.contains = function(nameClass, qName) {
    if (nameClass instanceof AnyName) {
        return true;
    } else if (nameClass instanceof AnyNameExcept) {
        return !this.contains(nameClass.nameClass);
    } else if (nameClass instanceof NsName) {
        return nameClass.uri == qName.uri;
    } else if (nameClass instanceof NsNameExcept) {
        return (nameClass.uri == qName.uri && !this.contains(nameClass.nameClass, qName));
    } else if (nameClass instanceof Name) {
        return (nameClass.uri == qName.uri && nameClass.localName == qName.localName);
    } else if (nameClass instanceof NameClassChoice) {
        return this.contains(nameClass.nameClass1, qName) || this.contains(nameClass.nameClass2, qName);
    }
    throw new Error('Unexpected result for ValidatorFunctions.contains() ' + nameClass.toString());
};

    /*
    nullable:: Pattern -> Bool
    nullable (Group p1 p2) = nullable p1 && nullable p2
    nullable (Interleave p1 p2) = nullable p1 && nullable p2
    nullable (Choice p1 p2) = nullable p1 || nullable p2
    nullable (OneOrMore p) = nullable p
    nullable (Element _ _) = False
    nullable (Attribute _ _) = False
    nullable (List _) = False
    nullable (Value _ _ _) = False
    nullable (Data _ _) = False
    nullable (DataExcept _ _ _) = False
    nullable NotAllowed = False
    nullable Empty = True
    nullable Text = True
    nullable (After _ _) = False
    */
ValidatorFunctions.prototype.nullable = function(pattern) {
    if (pattern instanceof Group) {
        return this.nullable(pattern.pattern1) && this.nullable(pattern.pattern2);
    } else if (pattern instanceof Interleave) {
        return this.nullable(pattern.pattern1) && this.nullable(pattern.pattern2);
    } else if (pattern instanceof Choice) {
        return this.nullable(pattern.pattern1) || this.nullable(pattern.pattern2);
    } else if (pattern instanceof OneOrMore) {
        return this.nullable(pattern.pattern);
    } else if (pattern instanceof Element) {
        return false;
    } else if (pattern instanceof Attribute) {
        return false;
    } else if (pattern instanceof List) {
        return false;
    } else if (pattern instanceof Value) {
        return false;
    } else if (pattern instanceof Data) {
        return false;
    } else if (pattern instanceof DataExcept) {
        return false;
    } else if (pattern instanceof NotAllowed) {
        return false;
    } else if (pattern instanceof Empty) {
        return true;
    } else if (pattern instanceof Text) {
        return true;
    } else if (pattern instanceof After) {
        return false;
    } 
    throw new Error('Unexpected result for ValidatorFunctions.nullable() ' + pattern);
};
    
    /*
    childDeriv :: Context -> Pattern -> ChildNode -> Pattern
    childDeriv cx p (TextNode s) = textDeriv cx p s
    childDeriv _ p (ElementNode qn cx atts children) =
      let p1 = startTagOpenDeriv p qn
          p2 = attsDeriv cx p1 atts
          p3 = startTagCloseDeriv p2
          p4 = childrenDeriv cx p3 children
      in endTagDeriv p4
    */
ValidatorFunctions.prototype.childDeriv = function(context, pattern, childNode) {
    if (childNode instanceof TextNode) {
        this.debug("validation of text node", pattern, childNode);
        return this.textDeriv(context, pattern, childNode.string, childNode);
    } else if (childNode instanceof ElementNode) {
        this.debug("beginning validation of childNode", pattern, childNode);
        var p1 = this.startTagOpenDeriv(pattern, childNode.qName, childNode);
        this.debug("validation of attributes", p1, childNode);
        var p2 = this.attsDeriv(childNode.context, p1, cloneArray(childNode.attributeNodes));
        this.debug("ending validation of childNode", p2, childNode);
        var p3 = this.startTagCloseDeriv(p2, childNode);
        this.debug("validation of children nodes", p3, childNode);
        var p4 = this.childrenDeriv(childNode.context, p3, cloneArray(childNode.childNodes));
        this.debug("end of validation", p4, childNode);
        return this.endTagDeriv(p4, childNode);
    }
    throw new Error('Unexpected result for ValidatorFunctions.childDeriv()' + childNode);
};

    /*
    textDeriv :: Context -> Pattern -> String -> Pattern
    textDeriv cx (Choice p1 p2) s = choice (textDeriv cx p1 s) (textDeriv cx p2 s)
    textDeriv cx (Interleave p1 p2) s = choice (interleave (textDeriv cx p1 s) p2) (interleave p1 (textDeriv cx p2 s))
    textDeriv cx (Group p1 p2) s =
      let p = group (textDeriv cx p1 s) p2
      in if nullable p1 then choice p (textDeriv cx p2 s) else p
    textDeriv cx (After p1 p2) s = after (textDeriv cx p1 s) p2
    textDeriv cx (OneOrMore p) s = group (textDeriv cx p s) (choice (OneOrMore p) Empty)
    textDeriv cx Text _ = Text
    textDeriv cx1 (Value dt value cx2) s =
      if datatypeEqual dt value cx2 s cx1 then Empty else NotAllowed
    textDeriv cx (Data dt params) s =
      if datatypeAllows dt params s cx then Empty else NotAllowed
    textDeriv cx (DataExcept dt params p) s =
      if datatypeAllows dt params s cx && not (nullable (textDeriv cx p s)) then Empty else NotAllowed
    textDeriv cx (List p) s =
      if nullable (listDeriv cx p (words s)) then Empty else NotAllowed
    textDeriv _ _ _ = NotAllowed
    */
ValidatorFunctions.prototype.textDeriv = function(context, pattern, string, childNode) {
    var choice1, choice2, group1;
    if (pattern instanceof Choice) {
        choice1 = this.textDeriv(context, pattern.pattern1, string, childNode);
        choice2 = this.textDeriv(context, pattern.pattern2, string, childNode);
        return this.choice(choice1, choice2);
    } else if (pattern instanceof Interleave) {
        choice1 = this.interleave(this.textDeriv(context, pattern.pattern1, string, childNode), pattern.pattern2);
        choice2 = this.interleave(pattern.pattern1, this.textDeriv(context, pattern.pattern2, string, childNode));
        return this.choice(choice1, choice2);
    } else if (pattern instanceof Group) {
        group1 = this.textDeriv(context, pattern.pattern1, string, childNode);
        var p = this.group(group1, pattern.pattern2);
        if (this.nullable(pattern.pattern1)) {
            choice2 = this.textDeriv(context, pattern.pattern1, string, childNode);
            return this.choice(p, choice2);
        } else {
            return p;
        }
    } else if (pattern instanceof After) {
        var after1 = this.textDeriv(context, pattern.pattern1, string, childNode);
        return this.after(after1, pattern.pattern2);
    } else if (pattern instanceof OneOrMore) {
        group1 = this.textDeriv(context, pattern.pattern, string, childNode);
        var group2 = this.choice(pattern, new Empty());
        return this.group(group1, group2);
    } else if (pattern instanceof Text) {
        return pattern;
    } else if (pattern instanceof Value) {
        return this.datatypeEqual(pattern.datatype, pattern.string, pattern.context, string, context);
    } else if (pattern instanceof Data) {
        return this.datatypeAllows(pattern.datatype, pattern.paramList, string, context);
    } else if (pattern instanceof DataExcept) {
        var datatypeAllowed = this.datatypeAllows(pattern.datatype, pattern.paramList, string, context);
        if (datatypeAllowed instanceof Empty && !this.nullable(this.textDeriv(context, pattern.pattern, string, childNode))) {
            return new Empty();
        } else {
            return new NotAllowed("data invalid, found [" + string + "]", pattern, childNode);
        }
    } else if (pattern instanceof List) {
        var listDeriv = this.listDeriv(context, pattern.pattern, this.words(string), childNode);
        if (this.nullable(listDeriv, childNode)) {
            return new Empty();
        } else {
            return new NotAllowed("list invalid, found [" + string + "]", pattern, childNode);
        }
    } else if (pattern instanceof NotAllowed) {
        return pattern;
    } else {
        return new NotAllowed("invalid pattern", pattern, childNode);
    }
};

    /*
    reverse the order of the array in order to use the function pop()
    */
ValidatorFunctions.prototype.words = function(string) {
    return string.split(/\s+/).reverse();
};

    /*
    listDeriv :: Context -> Pattern -> [String] -> Pattern
    listDeriv _ p [] = p
    listDeriv cx p (h:t) = listDeriv cx (textDeriv cx p h) t
    */
ValidatorFunctions.prototype.listDeriv = function(context, pattern, strings, childNode) {
    if (strings.length === 0) {
        return pattern;
    } else {
        return this.listDeriv(context, this.textDeriv(context, pattern, strings.pop(), childNode), strings);
    }
};

    /*
    choice :: Pattern -> Pattern -> Pattern
    choice p NotAllowed = p
    choice NotAllowed p = p
    choice p1 p2 = Choice p1 p2
    */
ValidatorFunctions.prototype.choice = function(pattern1, pattern2) {
    // in that case choose between NotAllowed according to their priority
    if (pattern1 instanceof NotAllowed && pattern2 instanceof NotAllowed) {
        if (!pattern1.priority) {
            return pattern2;
        } else if (!pattern2.priority) {
            return pattern1;
        }
        if (pattern1.priority < pattern2.priority) {
            return pattern2;
        }
        return pattern1;
    } else if (pattern2 instanceof NotAllowed) {
        return pattern1;
    } else if (pattern1 instanceof NotAllowed) {
        return pattern2;
    } else {
        return new Choice(pattern1, pattern2);
    }
};

    /*
    group :: Pattern -> Pattern -> Pattern
    group p NotAllowed = NotAllowed
    group NotAllowed p = NotAllowed
    group p Empty = p
    group Empty p = p
    group p1 p2 = Group p1 p2
    */
ValidatorFunctions.prototype.group = function(pattern1, pattern2) {
    if (pattern1 instanceof NotAllowed) {
        return pattern1;
    } else if (pattern2 instanceof NotAllowed) {
        return pattern2;
    } else if (pattern2 instanceof Empty) {
        return pattern1;
    } else if (pattern1 instanceof Empty) {
        return pattern2;
    } else {
        return new Group(pattern1, pattern2);
    }
};

    /*
    interleave :: Pattern -> Pattern -> Pattern
    interleave p NotAllowed = NotAllowed
    interleave NotAllowed p = NotAllowed
    interleave p Empty = p
    interleave Empty p = p
    interleave p1 p2 = Interleave p1 p2
    */
ValidatorFunctions.prototype.interleave = function(pattern1, pattern2) {
    if (pattern1 instanceof NotAllowed) {
        return pattern1;
    } else if (pattern2 instanceof NotAllowed) {
        return pattern2;
    } else if (pattern2 instanceof Empty) {
        return pattern1;
    } else if (pattern1 instanceof Empty) {
        return pattern2;
    } else {
        return new Interleave(pattern1, pattern2);
    }
};

    /*
    after :: Pattern -> Pattern -> Pattern
    after p NotAllowed = NotAllowed
    after NotAllowed p = NotAllowed
    after p1 p2 = After p1 p2
    */
ValidatorFunctions.prototype.after = function(pattern1, pattern2) {
    if (pattern2 instanceof NotAllowed) {
        return pattern2;
    } else if (pattern1 instanceof NotAllowed) {
        return pattern1;
    } else {
        return new After(pattern1, pattern2);
    }
};

    /*
    datatypeAllows :: Datatype -> ParamList -> String -> Context -> Bool
    datatypeAllows ("",  "string") [] _ _ = True
    datatypeAllows ("",  "token") [] _ _ = True
    */
ValidatorFunctions.prototype.datatypeAllows = function(datatype, paramList, string, context) {
    if (datatype.uri == "") {
        if (datatype.localName === "string" && paramList.length === 0) {
            return new Empty();
        } else if (datatype.localName === "token" && paramList.length === 0) {
            return new Empty();
        } else {
            return new NotAllowed("datatype uri is not specified", datatype, string);
        }
    } else if (!this.datatypeLibrary) {
        return new Empty();
    } else {
        return this.datatypeLibrary.datatypeAllows(datatype, paramList, string, context);
    }
};

    /*
    datatypeEqual :: Datatype -> String -> Context -> String -> Context -> Bool
    datatypeEqual ("",  "string") s1 _ s2 _ = (s1 == s2)
    datatypeEqual ("",  "token") s1 _ s2 _ = (normalizeWhitespace s1) == (normalizeWhitespace s2)
    */
ValidatorFunctions.prototype.datatypeEqual = function(datatype, string1, context1, string2, context2) {
    if (datatype.uri == "") {
        if (datatype.localName == "string") {
            if (string1 == string2) {
                return new Empty();
            } else {
                return new NotAllowed("strings are not equals", datatype, string2);
            }
        } else if (datatype.localName == "token") {
            if (this.normalizeWhitespace(string1) == this.normalizeWhitespace(string2)) {
                return new Empty();
            } else {
                return new NotAllowed("strings are not equals", datatype, string2);
            }
        }
    } else if (!this.datatypeLibrary) {
        return new Empty();
    }
    return this.datatypeLibrary.datatypeEqual(datatype, string1, context1, string2, context2);
};

    /*
    normalizeWhitespace :: String -> String
    normalizeWhitespace s = unwords (words s)
    */
ValidatorFunctions.prototype.normalizeWhitespace = function(string) {
    return string.split(/\s+/).join(" ");
};

    /*
    applyAfter :: (Pattern -> Pattern) -> Pattern -> Pattern
    applyAfter f (After p1 p2) = after p1 (f p2)
    applyAfter f (Choice p1 p2) = choice (applyAfter f p1) (applyAfter f p2)
    applyAfter f NotAllowed = NotAllowed
    */
ValidatorFunctions.prototype.applyAfter = function(funct, pattern) {
    if (pattern instanceof After) {
        return this.after(pattern.pattern1, funct.apply(pattern.pattern2));
    } else if (pattern instanceof Choice) {
        return this.choice(this.applyAfter(funct, pattern.pattern1), this.applyAfter(funct, pattern.pattern2));
    } else if (pattern instanceof NotAllowed) {
        return pattern;
    }
    throw new Error('Unexpected result for ValidatorFunctions.applyAfter() ' + pattern);
};

    /*
    startTagOpenDeriv :: Pattern -> QName -> Pattern
    startTagOpenDeriv (Choice p1 p2) qn =  choice (startTagOpenDeriv p1 qn) (startTagOpenDeriv p2 qn)
    startTagOpenDeriv (Element nc p) qn =
      if contains nc qn then after p Empty else NotAllowed
    startTagOpenDeriv (Interleave p1 p2) qn =
      choice (applyAfter (flip interleave p2) (startTagOpenDeriv p1 qn))
             (applyAfter (interleave p1) (startTagOpenDeriv p2 qn))
    startTagOpenDeriv (OneOrMore p) qn =
      applyAfter (flip group (choice (OneOrMore p) Empty))
                 (startTagOpenDeriv p qn)
    startTagOpenDeriv (Group p1 p2) qn =
      let x = applyAfter (flip group p2) (startTagOpenDeriv p1 qn)
      in if nullable p1 then
           choice x (startTagOpenDeriv p2 qn)
         else
           x
    startTagOpenDeriv (After p1 p2) qn =
      applyAfter (flip after p2) (startTagOpenDeriv p1 qn)
    startTagOpenDeriv _ qn = NotAllowed
    */
ValidatorFunctions.prototype.startTagOpenDeriv = function(pattern, qName, childNode) {
    var choice1, choice2, p1Deriv, p2Deriv;
    if (pattern instanceof Choice) {
        choice1 = this.startTagOpenDeriv(pattern.pattern1, qName, childNode);
        choice2 = this.startTagOpenDeriv(pattern.pattern2, qName, childNode);
        return this.choice(choice1, choice2);
    } else if (pattern instanceof Element) {
        if (this.contains(pattern.nameClass, qName)) {
            return this.after(pattern.pattern, new Empty());
        } else {
            return new NotAllowed("invalid tag name", pattern.nameClass, qName);
        }
    } else if (pattern instanceof Interleave) {
        p1Deriv = this.startTagOpenDeriv(pattern.pattern1, qName, childNode);
        choice1 = this.applyAfter(new flip(this.interleave, pattern.pattern2), p1Deriv);
        p2Deriv = this.startTagOpenDeriv(pattern.pattern2, qName, childNode);
        choice2 = this.applyAfter(new notFlip(this.interleave, pattern.pattern1), p2Deriv);
        return this.choice(choice1, choice2);
    } else if (pattern instanceof OneOrMore) {
        var pDeriv = this.startTagOpenDeriv(pattern.pattern, qName, childNode);
        return this.applyAfter(new flip(this.group, this.choice(pattern, new Empty())), pDeriv);
    } else if (pattern instanceof Group) {
        p1Deriv = this.startTagOpenDeriv(pattern.pattern1, qName, childNode);
        var x = this.applyAfter(new flip(this.group, pattern.pattern2), p1Deriv);
        if (this.nullable(pattern.pattern1)) {
            p2Deriv = this.startTagOpenDeriv(pattern.pattern2, qName, childNode);
            return this.choice(x, p2Deriv);
        } else {
            return x;
        }
    } else if (pattern instanceof After) {
        p1Deriv = this.startTagOpenDeriv(pattern.pattern1, qName, childNode);		
        return this.applyAfter(new flip(this.after, pattern.pattern2), p1Deriv);
    } else if (pattern instanceof NotAllowed) {
        return pattern;
    } else {
        return new NotAllowed("invalid pattern", pattern, childNode);
    }
};

    /*
    We make use of the standard Haskell function flip  which flips the order of the arguments of a function of two arguments. Thus,  flip applied to a function of two arguments f and an argument x returns a function of one argument g such that g(y) = f(y,  x). 
    */
function flip(funct, arg2) {
    this.funct = funct;
    this.arg2 = arg2;
}
flip.prototype.apply = function(arg1) {
    return this.funct(arg1, this.arg2);
};

function notFlip(funct, arg1) {
    this.funct = funct;
    this.arg1 = arg1;
}
notFlip.prototype.apply = function(arg2) {
    return this.funct(this.arg1, arg2);
};

    /*
    attsDeriv :: Context -> Pattern -> [AttributeNode] -> Pattern
    attsDeriv cx p [] = p
    attsDeriv cx p ((AttributeNode qn s):t) = attsDeriv cx (attDeriv cx p (AttributeNode qn s)) t
    */
ValidatorFunctions.prototype.attsDeriv = function(context, pattern, attributeNodes) {
    if (attributeNodes.length === 0) {
        return pattern;
    } else {
        var attDerivResult = this.attDeriv(context, pattern, attributeNodes.pop());
        var attsDerivResult = this.attsDeriv(context, attDerivResult, attributeNodes);
        return attsDerivResult;
    }
};

    /*
    attDeriv :: Context -> Pattern -> AttributeNode -> Pattern
    attDeriv cx (After p1 p2) att =
      after (attDeriv cx p1 att) p2
    attDeriv cx (Choice p1 p2) att =
      choice (attDeriv cx p1 att) (attDeriv cx p2 att)
    attDeriv cx (Group p1 p2) att =
      choice (group (attDeriv cx p1 att) p2)
             (group p1 (attDeriv cx p2 att))
    attDeriv cx (Interleave p1 p2) att =
      choice (interleave (attDeriv cx p1 att) p2)
             (interleave p1 (attDeriv cx p2 att))
    attDeriv cx (OneOrMore p) att =
      group (attDeriv cx p att) (choice (OneOrMore p) Empty)
    attDeriv cx (Attribute nc p) (AttributeNode qn s) =
      if contains nc qn && valueMatch cx p s then Empty else NotAllowed
    attDeriv _ _ _ = NotAllowed
    */
ValidatorFunctions.prototype.attDeriv = function(context, pattern, attributeNode) {
    var choice1, choice2, attDeriv1, attDeriv2;
    if (pattern instanceof After) {
        var attDerivResult = this.attDeriv(context, pattern.pattern1, attributeNode);
        return this.after(attDerivResult, pattern.pattern2);
    } else if (pattern instanceof Choice) {
        choice1 = this.attDeriv(context, pattern.pattern1, attributeNode);
        choice2 = this.attDeriv(context, pattern.pattern2, attributeNode);
        return this.choice(choice1, choice2);
    } else if (pattern instanceof Group) {
        attDeriv1 = this.attDeriv(context, pattern.pattern1, attributeNode);
        choice1 = this.group(attDeriv1, pattern.pattern2);
        attDeriv2 = this.attDeriv(context, pattern.pattern2, attributeNode);
        choice2 = this.group(pattern.pattern1, attDeriv2);
        return this.choice(choice1, choice2);
    } else if (pattern instanceof Interleave) {
        attDeriv1 = this.attDeriv(context, pattern.pattern1, attributeNode);
        choice1 = this.interleave(attDeriv1, pattern.pattern2);
        attDeriv2 = this.attDeriv(context, pattern.pattern2, attributeNode);
        choice2 = this.interleave(pattern.pattern1, attDeriv2);
        return this.choice(choice1, choice2);
    } else if (pattern instanceof OneOrMore) {
        attDerivResult = this.attDeriv(context, pattern.pattern, attributeNode);
        return this.group(attDerivResult, this.choice(pattern.pattern, new Empty()));
    } else if (pattern instanceof Attribute) {
        var attributeNameCheck = this.contains(pattern.nameClass, attributeNode.qName);
        if (attributeNameCheck) {
            var valueMatched = this.valueMatch(context, pattern.pattern, attributeNode.string, attributeNode);
            // AUGMENTATION : the AttributeNode is typed
            if (valueMatched instanceof Empty && (pattern.pattern instanceof Data || pattern.pattern instanceof DataExcept)) {
                attributeNode.setType(pattern.pattern.datatype.localName);
            }
            return valueMatched;
        } else {
            return new NotAllowed("invalid attribute", pattern, attributeNode);
        }
    } else if (pattern instanceof NotAllowed) {
        return pattern;
    } else {
        return new NotAllowed("invalid attributeNode", pattern, attributeNode);
    }
};

    /*
    valueMatch :: Context -> Pattern -> String -> Bool
    valueMatch cx p s = (nullable p && whitespace s) || nullable (textDeriv cx p s)
    */
ValidatorFunctions.prototype.valueMatch = function(context, pattern, string, childNode) {
    var nullable = this.nullable(pattern);
    var isWhitespace = this.whitespace(string);
    if (nullable && isWhitespace) {
        return true;
    }
    var textDerivResult = this.textDeriv(context, pattern, string, childNode);
    //in order to keep original NotAllowed pattern
    if (this.nullable(textDerivResult)) {
        return new Empty();
    } else {
        return textDerivResult;
    }
};

    /*
    startTagCloseDeriv :: Pattern -> Pattern
    startTagCloseDeriv (After p1 p2) =
      after (startTagCloseDeriv p1) p2
    startTagCloseDeriv (Choice p1 p2) =
      choice (startTagCloseDeriv p1) (startTagCloseDeriv p2)
    startTagCloseDeriv (Group p1 p2) =
      group (startTagCloseDeriv p1) (startTagCloseDeriv p2)
    startTagCloseDeriv (Interleave p1 p2) =
      interleave (startTagCloseDeriv p1) (startTagCloseDeriv p2)
    startTagCloseDeriv (OneOrMore p) =
      oneOrMore (startTagCloseDeriv p)
    startTagCloseDeriv (Attribute _ _) = NotAllowed
    startTagCloseDeriv p = p
    */
ValidatorFunctions.prototype.startTagCloseDeriv = function(pattern, childNode) {
    if (pattern instanceof After) {
        return this.after(this.startTagCloseDeriv(pattern.pattern1, childNode), pattern.pattern2);
    } else if (pattern instanceof Choice) {
        var choice1 = this.startTagCloseDeriv(pattern.pattern1, childNode);
        var choice2 = this.startTagCloseDeriv(pattern.pattern2, childNode);
        return this.choice(choice1, choice2);
    } else if (pattern instanceof Group) {
        var group1 = this.startTagCloseDeriv(pattern.pattern1, childNode);
        var group2 = this.startTagCloseDeriv(pattern.pattern2, childNode);
        return this.group(group1, group2);
    } else if (pattern instanceof Interleave) {
        var interleave1 = this.startTagCloseDeriv(pattern.pattern1, childNode);
        var interleave2 = this.startTagCloseDeriv(pattern.pattern2, childNode);
        return this.interleave(interleave1, interleave2);
    } else if (pattern instanceof OneOrMore) {
        return this.oneOrMore(this.startTagCloseDeriv(pattern.pattern, childNode));
    } else if (pattern instanceof Attribute) {
        // AUGMENTATION : if defaultValue is provided then it is optional, and it must be augmented
        if (pattern.defaultValue && childNode instanceof ElementNode && pattern.nameClass instanceof Name) {
            childNode.addAttribute(pattern);
        }
        return new NotAllowed("attribute missing", pattern, childNode);
    } else {
        return pattern;
    }
};

    /*
    oneOrMore :: Pattern -> Pattern
    oneOrMore NotAllowed = NotAllowed
    oneOrMore p = OneOrMore p
    */
ValidatorFunctions.prototype.oneOrMore = function(pattern) {
    if (pattern instanceof NotAllowed) {
        return pattern;
    } else {
        return new OneOrMore(pattern);
    }
};

    /*
    childrenDeriv :: Context -> Pattern -> [ChildNode] -> Pattern
    childrenDeriv cx p [] = childrenDeriv cx p [(TextNode "")]
    childrenDeriv cx p [(TextNode s)] =
        let p1 = childDeriv cx p (TextNode s)
        in if whitespace s then choice p p1 else p1
    childrenDeriv cx p children = stripChildrenDeriv cx p children
    */
ValidatorFunctions.prototype.childrenDeriv = function(context, pattern, childNodes) {
    if (childNodes.length === 0) {
        return pattern;
    } else if (childNodes.length === 1 && childNodes[0] instanceof TextNode) {
        var p1 = this.childDeriv(context, pattern, childNodes[0]);
        if (this.whitespace(childNodes[0].string)) {
            return this.choice(pattern, p1);
        } else {
            return p1;
        }
    } else {
        //in order to use pop(), reverse the order of the children
        return this.stripChildrenDeriv(context, pattern, childNodes.reverse());
    }
};

    /*
    stripChildrenDeriv :: Context -> Pattern -> [ChildNode] -> Pattern
    stripChildrenDeriv _ p [] = p
    stripChildrenDeriv cx p (h:t) = stripChildrenDeriv cx (if strip h then p else (childDeriv cx p h)) t
    */
ValidatorFunctions.prototype.stripChildrenDeriv = function(context, pattern, childNodes) {
    if (childNodes.length === 0) {
        return pattern;
    } else {
        var p = pattern;
        var childNodesCloned = cloneArray(childNodes);
        var childNode = childNodesCloned.pop();
        if (!this.strip(childNode)) {
            p = this.childDeriv(context, p, childNode);
        }
        return this.stripChildrenDeriv(context, p, childNodesCloned);
    }
};
    
    /*
    strip :: ChildNode -> Bool
    strip (TextNode s) = whitespace s
    strip _ = False
    */
ValidatorFunctions.prototype.strip = function(childNode) {
    if (childNode instanceof TextNode) {
        return this.whitespace(childNode.string);
    } else {
        return false;
    }
};
    
    /*
    whitespace :: String -> Bool
    whitespace s = all isSpace s
    */
ValidatorFunctions.prototype.whitespace = function(string) {
    return !(/[^\t\n\r ]/.test(string));
};

    /*
    endTagDeriv :: Pattern -> Pattern
    endTagDeriv (Choice p1 p2) = choice (endTagDeriv p1) (endTagDeriv p2)
    endTagDeriv (After p1 p2) = if nullable p1 then p2 else NotAllowed
    endTagDeriv _ = NotAllowed
    */
ValidatorFunctions.prototype.endTagDeriv = function(pattern, childNode) {
    if (pattern instanceof Choice) {
        var choice1 = this.endTagDeriv(pattern.pattern1, childNode);
        var choice2 = this.endTagDeriv(pattern.pattern2, childNode);
        return this.choice(choice1, choice2);
    } else if (pattern instanceof After) {
        if (this.nullable(pattern.pattern1)) {
            return pattern.pattern2;
        } else {
            return new MissingContent("missing content", pattern.pattern1, childNode);
        }
    } else if (pattern instanceof NotAllowed) {
        return pattern;
    } else {
        return new NotAllowed("invalid pattern", pattern, childNode);
    }
};

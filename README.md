enml-js
===========

[Evernote's ENML](http://dev.evernote.com/doc/articles/enml.php) utitlity for Javascript.

```

> enml.ENMLOfPlainText("Hello\nWorld!!")
"<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">\n<en-note style="word-wrap: break-word; -webkit-nbsp-mode: space; -webkit-line-break: after-white-space;"><div>Hello</div>\n<div>World!!</div>\n</en-note>"

> enml.PlainTextOfENML('<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">\n<en-note style="word-wrap: break-word; -webkit-nbsp-mode: space; -webkit-line-break: after-white-space;"><div>Hello</div>\n<div>World!!</div>\n</en-note>')
"Hello\nWorld!!"

```

### Node.js

    npm install enml-js

### Browser
  
    <script src="https://raw.github.com/berryboy/enml-js/master/lib/xml-writer.js"></script>
    <script src="https://raw.github.com/berryboy/enml-js/master/lib/xml-parser.js"></script>
    <script src="https://raw.github.com/berryboy/enml-js/master/enml.js"></script>
    
Functions
============

**enml.ENMLOfPlainText**(String) - Encode a given plain text into ENML format.

**enml.PlainTextOfENML**(String) - Translate ENML content back into normal plain text.

    > enml.PlainTextOfENML('<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">\n<en-note style="word-wrap: break-word; -webkit-nbsp-mode: space; -webkit-line-break: after-white-space;"><div>Hello</div>\n<div>World!!</div>\n</en-note>')
    "Hello\nWorld!!"

**enml.HTMLOfENML**(String, [ Resources ]) - Translate ENML to HTML for viewing in browsers. 

    > enml.HTMLOfENML('<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">\n<en-note style="word-wrap: break-word; -webkit-nbsp-mode: space; -webkit-line-break: after-white-space;"><div>Hello</div>\n<div>World!!</div>\n</en-note>')
    '<html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/></head><body style="word-wrap: break-word; -webkit-nbsp-mode: space; -webkit-line-break: after-white-space;" style="word-wrap: break-word; -webkit-nbsp-mode: space; -webkit-line-break: after-white-space;"><div>Hello</div>\n<div>World!!</div>\n</body></html>'

This function accepts an array of Resource object from Evernote Official Javascript SDK as the second parameter. Those resources (img, audio, video) will be embeded into HTML using base64 data encoding.

```javascriptd
var client = new evernote.Client({token: AUTH_TOKEN }); 
var noteStore = client.getNoteStore()

noteStore.getNote(noteGuid, true, true, true, true, function(err, note){

  var html = enml.HTMLOfENML(note.content, note.resources);
  //...
});
```

**enml.TodosOfENML**(String) - Extract Todo items in a given ENML text.

    > enml.TodosOfENML('<en-note style="word-wrap: break-word; -webkit-nbsp-mode: space; -webkit-line-break: after-white-space;"><en-todo/>Task1<div><en-todo checked="true"/>Task2<br/></div><div><en-todo/>With <b>Bold</b> <i>Italic</i> and <u>Underline</u><br/></div><div><u><en-todo/></u>With <font color="#FF2600">Color</font><br/></div></en-note>')
    [ { text: 'Task1', checked: false },
      { text: 'Task2', checked: true },
      { text: 'With Bold Italic and Underline',
        checked: false },
      { text: 'With Color', checked: false } ]

**enml.CheckTodoInENML**(String, Int, Bool) - Rewrite ENML content by changing check/uncheck value of the TODO in given position.

    > enml.CheckTodoInENML('<en-note style="word-wrap: break-word; -webkit-nbsp-mode: space; -webkit-line-break: after-white-space;"><en-todo/>Task1<div><en-todo checked="true"/>Task2<br/></div><div><en-todo/>With <b>Bold</b> <i>Italic</i> and <u>Underline</u><br/></div><div><u><en-todo/></u>With <font color="#FF2600">Color</font><br/></div></en-note>',0, true )
    <en-note style="word-wrap: break-word; -webkit-nbsp-mode: space; -webkit-line-break: after-white-space;"><en-todo checked="true"/>Task1<div><en-todo checked="true"/>Task2<br/></div><div><en-todo/>With <b>Bold</b> <i>Italic</i> and <u>Underline</u><br/></div><div><u><en-todo/></u>With <font color="#FF2600">Color</font><br/></div></en-note>'
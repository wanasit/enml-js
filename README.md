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

**enml.PlainTextOfENML**(String) - Translate ENML content into normal plain text.

        > enml.PlainTextOfENML('<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">\n<en-note style="word-wrap: break-word; -webkit-nbsp-mode: space; -webkit-line-break: after-white-space;"><div>Hello</div>\n<div>World!!</div>\n</en-note>')
        ' Hello World!! '

**enml.HTMLOfENML**(String, [ Map <String, {url: String, title: String}> ]) - Translate ENML to HTML for viewing in browsers. To show resources you have to provide a map of resources' hash and their src url and title.

    > enml.HTMLOfENML('<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">\n<en-note style="word-wrap: break-word; -webkit-nbsp-mode: space; -webkit-line-break: after-white-space;"><div>Hello</div>\n<div>World!!</div>\n</en-note>')
    '<html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/></head><body style="word-wrap: break-word; -webkit-nbsp-mode: space; -webkit-line-break: after-white-space;" style="word-wrap: break-word; -webkit-nbsp-mode: space; -webkit-line-break: after-white-space;"><div>Hello</div>\n<div>World!!</div>\n</body></html>'


**enml.TodosOfENML**(String) - Extract data of all TODO(s) in ENML text.

    > enml.TodosOfENML('<en-note style="word-wrap: break-word; -webkit-nbsp-mode: space; -webkit-line-break: after-white-space;"><en-todo/>Task1<div><en-todo checked="true"/>Task2<br/></div><div><en-todo/>With <b>Bold</b> <i>Italic</i> and <u>Underline</u><br/></div><div><u><en-todo/></u>With <font color="#FF2600">Color</font><br/></div></en-note>')
    [ { text: 'Task1', checked: false },
      { text: 'Task2', checked: true },
      { text: 'With Bold Italic and Underline',
        checked: false },
      { text: 'With Color', checked: false } ]

**enml.CheckTodoInENML**(String, Int, Bool) - Rewrite ENML content by changing check/uncheck value of the TODO in given position.

          > enml.CheckTodoInENML('<en-note style="word-wrap: break-word; -webkit-nbsp-mode: space; -webkit-line-break: after-white-space;"><en-todo/>Task1<div><en-todo checked="true"/>Task2<br/></div><div><en-todo/>With <b>Bold</b> <i>Italic</i> and <u>Underline</u><br/></div><div><u><en-todo/></u>With <font color="#FF2600">Color</font><br/></div></en-note>',
          0, true )
          <en-note style="word-wrap: break-word; -webkit-nbsp-mode: space; -webkit-line-break: after-white-space;"><en-todo checked="true"/>Task1<div><en-todo checked="true"/>Task2<br/></div><div><en-todo/>With <b>Bold</b> <i>Italic</i> and <u>Underline</u><br/></div><div><u><en-todo/></u>With <font color="#FF2600">Color</font><br/></div></en-note>'
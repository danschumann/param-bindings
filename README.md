# Param-Bindings

## Installation

### Bash

```bash
$ npm install param-bindings
```

### Javascript

```javascript
var connection = require("some sql module that doesn't let you use objects as arguments")

require('param-bindings')(connection, 'query');

// Now you can pass in objects to execute!  ( normal stuff will call the original execute method )
connection.query(
  'Select from :tableName where :column= :value, comma=:works_too',
  {tableName: 'users', column: 'name', value: 123, works_too: 456},
  function(){
    console.log('called back');
  }
);
// converts to 
// connection.query('Select from ? where ?= ?, comma=?', ['users', 'name', 123, 456], function(){...})

// whereas having called
wrap(connection, 'query', {increment: true, startsAt: 1}); // would output
// connection.query('Select from :1 where :2= :3, comma=:4', ['users', 'name', 123, 456], function(){...})
```

Note: it will convert `:param=:value` just fine, but I don't know that sql programs will like `:1=:2` anyway.


##Debug

```bash
$ DEBUG=* node-dev index.js
$ # or
$ DEBUG=param-bindings node-dev index.js
```

##Test

```bash
$ TEST_PARAM_BINDINGS=true DEBUG=param-bindings node-dev /node_modules/param-bindings/index.js
```

###LICENSE

The MIT License (MIT)

Copyright (c) 2013 danschumann

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

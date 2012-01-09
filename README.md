## The What

This is a fork of the xmlrpc module to allow XML-RPC calls from the browser.
This is a pure JavaScript XML-RPC client that can both be used in node.js
and in the browser through pakmanager.

Pure JavaScript means that the
[XML parsing](https://github.com/robrighter/node-xml) and
[XML building](https://github.com/robrighter/node-xml) use pure JavaScript
libraries, so no extra C dependencies or build requirements. Furthermore,
core node.js modules are only required for testing, not for deployment.
The server functionality of the original xmlrpc module has been disabled
because this is non-trivial for browsers.


## The How

### To Install

```bash
npm install xmlrpc
```

### To Use

The client-server.js in the example directory has an nicely commented example of
using xmlrpc as an XML-RPC server and client (they even talk to each other!).

TODO: This is still an example from the original XML-RPC module and does not work
at the moment. It is kept because it might be possible to convert it such that
it uses the original server, but the forked client.

A brief example:

```javascript
var xmlrpc = require('xmlrpc')

// Creates an XML-RPC server to listen to XML-RPC method calls
var server = xmlrpc.createServer({ host: 'localhost', port: 9090 })

// Handle method calls by listening for events with the method call name
server.on('anAction', function (err, params, callback) {
  console.log('Method call params for \'anAction\': ' + params)

  // ...perform an action...

  // Send a method response with a value
  callback(null, 'aResult')
})
console.log('XML-RPC server listening on port 9091')

// Waits briefly to give the XML-RPC server time to start up and start
// listening
setTimeout(function () {
  // Creates an XML-RPC client. Passes the host information on where to
  // make the XML-RPC calls.
  var client = xmlrpc.createClient({ host: 'localhost', port: 9090, path: '/'})

  // Sends a method call to the XML-RPC server
  client.methodCall('anAction', ['aParam'], function (error, value) {
    // Results of the method response
    console.log('Method response for \'anAction\': ' + value)
  })

}, 1000)
```

Output from the example:

```
XML-RPC server listening on port 9090
Method call params for 'anAction': aParam
Method response for 'anAction': aResult
```

### To Test

XML-RPC must be precise so there are an extensive set of test cases in the test
directory. [Vows](http://vowsjs.org/) is the testing framework and [Travis
CI](http://travis-ci.org/baalexander/node-xmlrpc) is used for Continuous
Integration.

To run the test suite:

`make test`

If submitting a bug fix, please update the appropriate test file too.


## The License (MIT)

Released under the MIT license. See the LICENSE file for the complete wording.


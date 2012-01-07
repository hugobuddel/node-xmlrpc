var ahr2          = require('ahr2')
  //, http          = require('http')
  //, https         = require('https')
  , url           = require('./turl')
  , xmlrpcBuilder = require('./xmlrpc-builder.js')
  , xmlrpcParser  = require('./xmlrpc-parser.js')

// The node.js core modules have been replaced to make the client independent
// on node.js:
// - 'http' and 'https' are substituted with 'ahr2'. All unit tests pass.
// - 'url' is substituted with 'turl'. This is a copy of node.js's 'url'
//   without punycode support.

/**
 * Creates a Client object for making XML-RPC method calls.
 *
 * @constructor
 * @param {Object|String} options - Server options to make the HTTP request to.
 *                                  Either a URI string
 *                                  (e.g. 'http://localhost:9090') or an object
 *                                  with fields:
 *   - {String} host              - (optional)
 *   - {Number} port
 * @param {Boolean} isSecure      - True if using https for making calls,
 *                                  otherwise false.
 * @return {Client}
 */
function Client(options, isSecure) {

  // Invokes with new if called without
  if (false === (this instanceof Client)) {
    return new Client(options, isSecure)
  }

  // If a string URI is passed in, converts to URI fields
  if (typeof options === 'string') {
    options = url.parse(options)
    options.host = options.hostname
    options.path = options.pathname
  }

  // Set the HTTP request headers
  var headers = {
    'User-Agent'     : 'NodeJS XML-RPC Client'
  , 'Content-Type'   : 'text/xml'
  , 'Accept'         : 'text/xml'
  , 'Accept-Charset' : 'UTF8'
  , 'Connection'     : 'Keep-Alive'
  }
  options.headers = options.headers || {}

  if (options.headers.Authorization == null &&
      options.basic_auth != null &&
      options.basic_auth.user != null &&
      options.basic_auth.pass != null) {
    options.headers['Authorization'] = 'Basic ' + new Buffer(options.basic_auth.user + ":" + options.basic_auth.pass).toString('base64')
  }
  
  // The 'http' module defaults to 'localhost' when no host is given.
  // The 'ahr2' module does not, so explicitly do so here.
  if (options['host'] === undefined) {
      options['host'] = 'localhost'
  }

  for (var attribute in headers) {
    if (options.headers[attribute] === undefined) {
      options.headers[attribute] = headers[attribute]
    }
  }

  options.method = 'POST'
  this.options = options

  this.isSecure = (isSecure === true) ? true : false
}

/**
 * Makes an XML-RPC call to the server specified by the constructor's options.
 *
 * @param {String} method     - The method name.
 * @param {Array} params      - Params to send in the call.
 * @param {Function} callback - function(error, value) { ... }
 *   - {Object|null} error    - Any errors when making the call, otherwise null.
 *   - {mixed} value          - The value returned in the method response.
 */
Client.prototype.methodCall = function(method, params, callback) {
  var that = this

  // Creates the XML to send
  xmlrpcBuilder.buildMethodCall(method, params, function(error, xml) {

    that.options.headers['Content-Length'] = xml.length

    // Uses HTTPS to send request if specified
    //var httpRequester = (that.isSecure) ? https : http

    // POSTs the XML to the server
    // The 'ahr2' call is based on the 'http' call that was used originally.
    // The original call is kept commented out below because the replacement
    // is not perfect yet.
    ahr2.post(
      "http://" + that.options.host + ":" + that.options.port + that.options.path,
      { },
      xml
    ).when(function (err, ahr, data) {
      if (err !== undefined) {
        callback(err, null)
      } else {
      // For some reason, the node.js version of ahr2 and the browser
      // version (through pakmanager) return different objects.
      var serialized = data;
      // 'string' is required by xmlrpcParser, which is never provided.
      if (typeof(serialized) !== 'string') {
        // On firefox an XML document is returned
        if ('nodeName' in serialized) {
          // http://www.sencha.com/forum/showthread.php?34553-Convert-DOM-XML-Document-to-string
          try {
            // XMLSerializer exists in current Mozilla browsers
            serializer = new XMLSerializer();
            serialized = serializer.serializeToString(data);
          }
          catch (e) {
            // Internet Explorer has a different approach to serializing XML
            serialized = data.xml;
          }
        } else {
          serialized = data.toString();
        }
      } else {
        // Already a string
      }
      xmlrpcParser.parseMethodResponse(serialized, callback)
      // The original call allowed the data to be streamed. This version
      // does not, although ahr2 probably supports it.
      xmlrpcParser.close()
      }
    });
    
    /*
    // The original call.
    var request = httpRequester.request(that.options, function(result) {
      result.setEncoding('utf8')

      var hasReceivedData = false
      result.on('data', function(chunk) {
        // The first time data is received, start the parser
        if (!hasReceivedData) {
          hasReceivedData = true
          xmlrpcParser.parseMethodResponse(chunk, callback)
        }
        // Any subsequent data received is fed into the parser
        else {
          xmlrpcParser.write(chunk)
        }
      })

      result.on('end', function(chunk) {
        xmlrpcParser.close()
      })

      result.on('error', function(error) {
        callback(error, null)
      })
    })

    request.on('error', function(error) {
      callback(error, null)
    })

    request.write(xml, 'utf8')
    request.end()
    */
  })

}

module.exports = Client


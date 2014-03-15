var program = require('commander');
var connect = require('connect');
var inject  = require('connect-inject');
var watch   = require('watch');
var http    = require('http');

program
  .version('0.0.1')
  .option('-d, --dir  [value]', 'Directory to serve')
  .option('-p, --port [value]', 'Port to server on')
  .parse(process.argv);

var dir      = program.dir || './';
var port     = program.port || 3000;
var snippets = [
  "<script src=\"/socket.io/socket.io.js\"></script>",
  "<script>io.connect(window.location.origin).on('reload', function (data) { window.location.reload(); });</script>",
]


var app = connect()
  .use(connect.logger('dev'))
  .use(inject({ snippet: snippets }))
  .use(connect.static(dir));


var server = http.createServer(app);
var io     = require('socket.io').listen(server);


// Start Monitor
watch.watchTree(dir, function (f, curr, prev) {
  if (typeof f == "object" && prev === null && curr === null) {
    // Finished walking the tree
  } else  if (prev === null) {
    // f is a new File
  } else if ( curr != null && curr.nlink === 0) {
    // f was removed
  } else {
    // f was changed
    io.sockets.emit('reload');
  }
});



// Start Server
server.listen(port);
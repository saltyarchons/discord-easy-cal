const http = require('http');
const url = require('url');

http.createServer((req, res) => {
    const urlparameters = url.parse(req.url, true);
    // TODO: make path read from config
    if (urlparameters.pathname === '/easyCalAuth') {
        const token = urlparameters.query.code;
        const guild = urlparameters.query.state
    }
    res.write('Hello World!');
}).listen(8080);

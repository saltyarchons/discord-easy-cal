const http = require('http');
const url = require('url');
const logger = require('winston');

http.createServer((req, res) => {
    const urlparameters = url.parse(req.url, true);
    logger.info(req.url);
    // TODO: make path read from config
    if (urlparameters.pathname === '/easyCalAuth') {
        const code = urlparameters.query.code;
        logger.info(code);
    }
    res.write('Hello World!');
}).listen(8080);

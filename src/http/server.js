const http = require('http');
const url = require('url');
const ServiceBase = require('../serviceBase');

exports.HttpServer = class extends ServiceBase {
    constructor(app) {
        super(app);
        this.listeningPort = 8080;
        this.setPort(this.config.http.port);
    }

    start() {
        const bot = this;

        http.createServer((req, res) => {
            const urlparameters = url.parse(req.url, true);
            // TODO: make path read from config
            if (urlparameters.pathname === '/easyCalAuth') {
                const token = urlparameters.query.code;
                const guild = urlparameters.query.state;
                bot.database.connect();
                bot.database.putCalendar({
                    id: guild,
                    token,
                });
            }
            res.write('Hello World!');
        }).listen(bot.listeningPort);
    }

    setPort(port) {
        if (typeof port === 'number' && port <= 65535) {
            this.listeningPort = port;
        } else {
            throw new RangeError(`Invalid Listening Port, port ${port}`);
        }
    }
};

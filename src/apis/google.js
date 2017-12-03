const ServiceBase = require('../serviceBase');
const google = require('googleapis');

exports.GoogleApi = class extends ServiceBase {
    init() {
        super.init();
        this.SCOPES = ['https://www.googleapis.com/auth/calendar'];
        this.oauth2Client = new google.auth.OAuth2(
            this.auth.gcal.client_id,
            this.auth.gcal.client_secret,
            this.auth.gcal.redirect_uris[0],
        );
    }

    start() {
        super.start();
        this.getSessionToken(321396380054585344);
        return this;
    }

    getAuthUrl(guildid) {
        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: this.SCOPES,
            state: guildid,
        });
    }

    getSessionToken(guildid) {
        const authCode = this.app.services.database.getCalendarById(guildid);
        let token = this.app.services.database.getToken(guildid);
        if (!token) {
            token = this.oauth2Client.getToken(authCode, function test(err, tokens) {
                if (!err) {
                    this.logger.info('token is $(token)');
                    this.oauth2Client.setCredentials(tokens);
                }
            });
        }
    }

    /* start() {
        super.start();
        const bot = this;

        http.createServer((req, res) => {
            const urlparameters = url.parse(req.url, true);
            // TODO: make path read from config
            if (urlparameters.pathname === '/easyCalAuth') {
                const token = urlparameters.query.code;
                const guild = urlparameters.query.state;
                bot.services.database.putCalendar({
                    id: guild,
                    token,
                });
            }
            res.write('Hello World!');
        }).listen(bot.listeningPort);
    } */
};

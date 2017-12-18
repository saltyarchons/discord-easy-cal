const ServiceBase = require('../serviceBase');
const google = require('googleapis');

exports.GoogleApi = class extends ServiceBase {
    init() {
        super.init();
        this.SCOPES = ['https://www.googleapis.com/auth/calendar'];
        this.oauth2Client = new google.auth.OAuth2(
            this.bot.auth.gcal.client_id,
            this.bot.auth.gcal.client_secret,
            this.bot.auth.gcal.redirect_uris[0],
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

    // TODO: handle rejected promise
    getSessionToken(guildid) {
        this.guildid = guildid;
        this.bot.services.database.getCalendarById(guildid).then((result) => {
            this.oauth2Client.getToken(result.token, (err, tokens) => {
                this.bot.logger.info(tokens);
                this.bot.logger.info(err);
                if (!err) {
                    this.bot.services.database.putToken(this.guildid, tokens);
                }
            });
        });
    }
};

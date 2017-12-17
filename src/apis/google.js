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
        this.guildid = guildid;
        this.app.services.database.getCalendarById(guildid).then(function (result) {
            this.oauth2Client.getToken(result.token, function test(err, tokens) {
                if (!err) {
                    this.app.services.database.putToken(this.guildid, tokens);
                }
            }.bind(this));
        }.bind(this));
    }
};

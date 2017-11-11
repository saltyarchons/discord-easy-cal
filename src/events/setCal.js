const google = require('googleapis');
const auth = require('../../auth.json');

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

exports.run = (client, logger, message, args) =>{
    const clientSecret = auth.gcal.client_secret;
    const clientId = auth.gcal.client_id;
    const redirectUrl = auth.gcal.redirect_uris[0];
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUrl);

    // check for previously stored token
    // get new token
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        state: message.guild.id,
    });
    message.channel.send(`Authorize this app by visiting this url: ${authUrl}`);
};

exports.aliases = ['gc'];

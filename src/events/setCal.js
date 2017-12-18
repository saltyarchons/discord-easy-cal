exports.run = (client, logger, message, args, bot) => {
    const authUrl = bot.services.googleApi.getAuthUrl();
    message.channel.send(`Authorize this app by visiting this url: ${authUrl}`);
};

exports.aliases = ['gc'];

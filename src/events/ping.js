exports.run = (client, logger, message) => {
    message.channel.send('pong!').catch(logger.error);
};

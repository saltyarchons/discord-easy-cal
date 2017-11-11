const { ConversationHandler } = require('../messaging/conversationHandler');
const moment = require('moment');

exports.run = (client, logger, message) => {
    const conversationHandler = new ConversationHandler(logger);

    const waitTime = moment.duration(100, 'seconds').milliseconds();
    conversationHandler
        .ask('Please enter a name for the event', waitTime, undefined, (content) => {
            return `Please confirm that the event name "${content}" is corrrect.`;
        })
        .then('Please enter a start time for the event', waitTime, (content) => {
            if (content === 'banana') {
                return { passed: true };
            }

            return { passed: false, message: 'The response should be banana' };
        })
        .then('Please enter an end time for the event', waitTime)
        .then('Please enter the location for the event', waitTime)
        .end('Thanks!')
        .run(message, (replies) => {
            message.channel.send(JSON.stringify(replies));
        });
};

exports.aliases = ['c'];

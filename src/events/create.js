const { ConversationHandler } = require('../messaging/conversationHandler');
const moment = require('moment');

function _validateTime(timeString) {
    const time = moment.duration(timeString);
    const asMilliseconds = time.asMilliseconds();
    if (time.isValid() && asMilliseconds) {
        return { passed: true };
    }

    return { passed: false, message: 'Failure reading time, please enter a valid time.' };
}

function _validateDate(dateString) {
    const date = moment(dateString);
    if (date.isValid()) {
        return { passed: true };
    }

    return { passed: false, message: 'Failure reading date, please enter a valid date.' };
}

exports.run = (client, logger, message) => {
    const conversationHandler = new ConversationHandler(logger);

    const waitTime = moment.duration(100, 'seconds').milliseconds();
    conversationHandler
        .ask('Please enter a name for the event', waitTime, undefined, (content) => {
            return `Please confirm that the event name "${content}" is corrrect.`;
        })
        .then('Please enter a start date for the event', waitTime, (content) => {
            return _validateDate(content);
        })
        .then('Please enter a start time for the event', waitTime, (content) => {
            return _validateTime(content);
        })
        .then('Please enter an end time for the event', waitTime, (content) => {
            return _validateTime(content);
        })
        .then('Please enter the location for the event', waitTime)
        .end('Thanks!')
        .run(message, (replies) => {
            message.channel.send(JSON.stringify(replies));
        });
};

exports.aliases = ['c'];

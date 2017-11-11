const Discord = require('discord.js');

/**
 * Exports the Class ConversationHandler
 * The fluent interface can be used to create 'conversations',
 * which return the users input into a callback function when run.
 */
exports.ConversationHandler = class {
    constructor(_logger) {
        this.logger = _logger;
        this.messageChain = [];
        this.replies = [];
    }

    /**
     * Begins a fluent conversation creation chain,
     * adding a new question to the conversation list.
     * @param {String} question The question to ask the user.
     * @param {Number} timeout The length of time (in milliseconds) top wait for user input.
     * @param {Function} validationCallback The callback to be called when user input is validated
     * @param {Function} confirmCallback The callback to be called when user input can be confirmed
     */
    ask(question, timeout, validationCallback, confirmCallback) {
        this.messageChain = [];
        this.replies = [];

        return this.then(question, timeout, validationCallback, confirmCallback);
    }

    /**
     * Continues a fluent conversation creation chain,
     * adding a new question to the conversation list.
     * @param {String} question The question to ask the user.
     * @param {Number} timeout The length of time (in milliseconds) top wait for user input.
     * @param {Function} validationCallback The callback to be called when user input is validated
     * @param {Function} confirmCallback The callback to be called when user input can be confirmed
     */
    then(question, timeout, validationCallback, confirmCallback) {
        this.messageChain.push({
            type: 'question', question, timeout, validationCallback, confirmCallback,
        });
        return this;
    }

    /**
     * Ends a fluent conversation creation change, adding a final response to the conversation list
     * @param {String} finalResponse The reponse to send the the user at the end of the conversation
     */
    end(finalResponse) {
        this.messageChain.push({ type: 'end', question: finalResponse });
        return this;
    }

    /**
     * Runs a the conversation, asking each question the list sequntially.
     * @param {String} message The root message of the conversation.
     * @param {Function} callback The callback to be called on completion of the conversation.
     */
    run(message, callback) {
        // Retrieve the first question in the qestion array.
        const questions = this.messageChain.splice(0, 1);
        if (questions.length === 0) {
            callback(this.replies);
            return;
        }

        const question = questions[0];

        /* If we are at the end of the conversation,
        send the final reply and call the ending callback. */
        if (question.type === 'end') {
            message.channel.send(question.question);
            callback(this.replies);
            return;
        }

        // Send the question to the user.
        this.logger.info(`Asking question ${question.question}`);
        message.channel.send(question.question);

        // Create message collector to listen to the channel for a response from the user.
        const collector = new Discord.MessageCollector(message.channel, (m) => {
            return m.author.id === message.author.id;
        }, { time: question.timeout });

        collector.on('collect', (response) => {
            // If we have a valitation callback, call it.
            if (question.validationCallback) {
                const result = question.validationCallback(response.content);
                /* If the response did not pass validation, we send the validation message back
                 to the user and then ask the question again. */
                if (result.passed !== true) {
                    message.channel.send(result.message);
                    this.messageChain.unshift(question);
                    this.run(response, callback);
                    collector.cleanup();
                    return;
                }
            }

            // If we have a confirmation callback, call it.
            if (question.confirmCallback) {
                let confirmText = question.confirmCallback(response.content);
                confirmText += ' (Yes|No)';

                // Create message collector to listen to the channel for a response from the user.
                const confirmCollector = new Discord.MessageCollector(message.channel, (m) => {
                    return m.author.id === message.author.id;
                }, { time: question.timeout });

                // Send confirmation message to the user.
                message.channel.send(confirmText);

                /* Cleanup the first collector to ensure we do not have
                more then one listers on the channel */
                collector.cleanup();

                confirmCollector.on('collect', (confirmResponse) => {
                    if (confirmResponse.content.toLowerCase() === 'yes'
                        || confirmResponse.content.toLowerCase() === 'y') {
                        // If user replies yes, ask the next question.
                        this.run(response, callback);
                    } else {
                        // if user replies anything but yes, re-ask the current question
                        this.messageChain.unshift(question);
                        this.run(response, callback);
                    }

                    /* Cleanup the confirm collector to ensure we do not have
                     more then one listers on the channel */
                    confirmCollector.cleanup();
                });

                return;
            }

            // Ask the next question.
            this.replies.push({ question, response: response.content });
            this.run(response, callback);

            /* Cleanup the first collector to ensure we do not have
                more then one listers on the channel */
            collector.cleanup();
        });
    }
};

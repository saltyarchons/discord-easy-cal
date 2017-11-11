const Discord = require('discord.js');

exports.ConversationHandler = class {
    constructor(_logger) {
        this.logger = _logger;
        this.messageChain = [];
        this.replies = [];
    }

    ask(question, timeout, validationCallback, confirmCallback) {
        this.messageChain = [];
        this.replies = [];

        return this.then(question, timeout, validationCallback, confirmCallback);
    }

    then(question, timeout, validationCallback, confirmCallback) {
        this.messageChain.push({
            type: 'question', question, timeout, validationCallback, confirmCallback,
        });
        return this;
    }

    end(finalResponse) {
        this.messageChain.push({ type: 'end', question: finalResponse });
        return this;
    }

    run(message, callback) {
        const questions = this.messageChain.splice(0, 1);
        if (questions.length === 0) {
            return;
        }

        const question = questions[0];

        if (question.type === 'end') {
            message.channel.send(question.question);
            callback(this.replies);
            return;
        }

        this.logger.info(`Asking question ${question.question}`);
        message.channel.send(question.question);

        const collector = new Discord.MessageCollector(message.channel, (m) => {
            return m.author.id === message.author.id;
        }, { time: question.timeout });

        collector.on('collect', (response) => {
            if (question.validationCallback) {
                const result = question.validationCallback(response.content);
                if (result.passed !== true) {
                    message.channel.send(result.message);
                    this.messageChain.unshift(question);
                    this.run(response, callback);
                    collector.cleanup();
                    return;
                }
            }

            if (question.confirmCallback) {
                let confirmText = question.confirmCallback(response.content);
                confirmText += ' (Yes|No)';

                const confirmCollector = new Discord.MessageCollector(message.channel, (m) => {
                    return m.author.id === message.author.id;
                }, { time: question.timeout });

                message.channel.send(confirmText);
                collector.cleanup();

                confirmCollector.on('collect', (confirmResponse) => {
                    if (confirmResponse.content.toLowerCase() === 'yes'
                        || confirmResponse.content.toLowerCase() === 'y') {
                        this.run(response, callback);
                    } else {
                        this.messageChain.unshift(question);
                        this.run(response, callback);
                    }

                    confirmCollector.cleanup();
                });

                return;
            }

            this.replies.push({ question, response: response.content });
            this.run(response, callback);
            collector.cleanup();
        });
    }
};

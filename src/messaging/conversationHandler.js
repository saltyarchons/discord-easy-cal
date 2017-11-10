const Discord = require('discord.js');

exports.ConversationHandler = class {
    constructor(_logger) {
        this.logger = _logger;
        this.messageChain = [];
        this.replies = [];
    }

    ask(question, timeout) {
        this.messageChain = [];
        this.messageChain.push({ type: 'question', question, timeout });
        return this;
    }

    then(question, timeout) {
        this.messageChain.push({ type: 'question', question, timeout });
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
            this.replies.push({ question, response: response.content });
            this.run(response, callback);
            collector.cleanup();
        });
    }
};

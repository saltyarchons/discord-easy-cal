/* eslint import/no-dynamic-require: 0 */
/* eslint global-require: 0 */
/* eslint comma-dangle: 0 */
const ServiceBase = require('./serviceBase');
const Discord = require('discord.js');
const fs = require('fs');

exports.BotClient = class extends ServiceBase {
    constructor(app) {
        super(app);
        this.client = new Discord.Client();
        this.events = [];
    }

    init() {
        super.init();
        const instance = this;

        // Load our events
        fs.readdir('./src/events/', (err, files) => {
            if (err) return instance.bot.logger.error(err);
            files.forEach((file) => {
                const eventFunction = require(`./events/${file}`);
                const eventName = file.split('.')[0];
                instance.events.push({
                    name: eventName,
                    aliases: eventFunction.aliases,
                });
            });
            return true;
        });

        this.client.on('ready', () => {
            instance.bot.logger.info('Connected');
            instance.bot.logger.info('Logged in as: ');
            instance.bot.logger.info(`${this.client.user.username} - (${instance.client.user.id})`);
        });

        this.client.on('message', (message) => {
            // Ignore messages from instances
            if (message.author.instance) return;
            // Ignore messages which do not start in the prefix specified in the config
            if (message.content.indexOf(instance.bot.config.prefix) !== 0) return;

            // Gather args from the input command
            const args = message.content.slice(instance.bot.config.prefix.length).trim().split(/ +/g);
            // Split the command from the args and assign
            const command = args.shift().toLowerCase();

            // Try to find the file that contains the command specified
            // https://stackoverflow.com/questions/45856446/discord-js-reply-to-message-then-wait-for-reply
            const event = instance.events.find((e) => {
                return e.name === command || (e.aliases && e.aliases.find((a) => {
                    return a === command;
                }));
            });
            if (event) {
                try {
                    const commandFile = require(`./events/${event.name}.js`);
                    // Run the command
                    commandFile.run(
                        instance.client,
                        instance.bot.logger,
                        message,
                        args,
                        instance.bot
                    );
                } catch (err) {
                    message.reply('An error occured!');
                    instance.logger.error(err);
                }
            }
        });
    }

    start() {
        super.start();
        // Log in the instance
        this.client.login(this.bot.auth.token);
    }
};

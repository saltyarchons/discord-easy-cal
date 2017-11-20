/* eslint import/no-dynamic-require: 0 */
/* eslint global-require: 0 */
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
        const bot = this;

        // Load our events
        fs.readdir('./src/events/', (err, files) => {
            if (err) return bot.logger.error(err);
            files.forEach((file) => {
                const eventFunction = require(`./events/${file}`);
                const eventName = file.split('.')[0];
                bot.events.push({
                    name: eventName,
                    aliases: eventFunction.aliases,
                });
            });
            return true;
        });

        this.client.on('ready', () => {
            bot.logger.info('Connected');
            bot.logger.info('Logged in as: ');
            bot.logger.info(`${this.client.user.username} - (${bot.client.user.id})`);
        });

        this.client.on('message', (message) => {
            // Ignore messages from bots
            if (message.author.bot) return;
            // Ignore messages which do not start in the prefix specified in the config
            if (message.content.indexOf(bot.config.prefix) !== 0) return;

            // Gather args from the input command
            const args = message.content.slice(this.config.prefix.length).trim().split(/ +/g);
            // Split the command from the args and assign
            const command = args.shift().toLowerCase();

            // Try to find the file that contains the command specified
            // https://stackoverflow.com/questions/45856446/discord-js-reply-to-message-then-wait-for-reply
            const event = bot.events.find((e) => {
                return e.name === command || (e.aliases && e.aliases.find((a) => {
                    return a === command;
                }));
            });
            if (event) {
                try {
                    const commandFile = require(`./events/${event.name}.js`);
                    // Run the command
                    commandFile.run(bot.client, bot.logger, message, args);
                } catch (err) {
                    message.reply('An error occured!');
                    bot.logger.error(err);
                }
            }
        });
    }

    start() {
        // Log in the bot
        this.client.login(this.auth.token);
    }
};

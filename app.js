/* eslint no-unused-vars: 0 */
/* eslint import/no-dynamic-require: 0 */
/* eslint global-require: 0 */
const Discord = require('discord.js');
const logger = require('winston');
const auth = require('./auth.json'); // eslint-disable-line import/no-unresolved
const config = require('./config.json');
const db = require('./src/db/db.js');
const fs = require('fs');
const httpServer = require('./src/http/server.js');
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true,
});
logger.level = 'debug';

// Initialize Discord Bot
const client = new Discord.Client();

// Start DB
const database = new db.DB(config);
database.connect().then(() => {
    logger.info('DB Ready');
}).catch(() => {
    logger.error('Failed to connect to ElasticSearch, terminating process.');
    process.exit(1);
});

const events = [];

// Load our events
fs.readdir('./src/events/', (err, files) => {
    if (err) return logger.error(err);
    files.forEach((file) => {
        const eventFunction = require(`./src/events/${file}`);
        const eventName = file.split('.')[0];
        events.push({
            name: eventName,
            aliases: eventFunction.aliases,
        });
    });
    return true;
});

client.on('ready', () => {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(`${client.user.username} - (${client.user.id})`);
});

client.on('message', (message) => {
    // Ignore messages from bots
    if (message.author.bot) return;
    // Ignore messages which do not start in the prefix specified in the config
    if (message.content.indexOf(config.prefix) !== 0) return;

    // Gather args from the input command
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    // Split the command from the args and assign
    const command = args.shift().toLowerCase();

    // Try to find the file that contains the command specified
    // https://stackoverflow.com/questions/45856446/discord-js-reply-to-message-then-wait-for-reply
    const event = events.find((e) => {
        return e.name === command || (e.aliases && e.aliases.find((a) => {
            return a === command;
        }));
    });
    if (event) {
        try {
            const commandFile = require(`./src/events/${event.name}.js`);
            // Run the command
            commandFile.run(client, logger, message, args);
        } catch (err) {
            message.reply('An error occured!');
            logger.error(err);
        }
    }
});

// Log in the bot
client.login(auth.token);

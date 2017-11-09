var Discord = require('discord.js');
var logger = require('winston');
var auth = require('./auth.json');
var config = require('./config.json');
const fs = require("fs");

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

// Initialize Discord Bot
const client = new Discord.Client();

const events = [];

// Load our events 
fs.readdir("./src/events/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        let eventFunction = require(`./src/events/${file}`);
        let eventName = file.split(".")[0];
        events.push(eventName);
    });
});

client.on('ready', () => {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(client.user.username + ' - (' + client.user.id + ')');
});

client.on('message', message => {
    // Ignore messages forom bots
    if (message.author.bot) return;
    // Ignore messages which do not start in the prefix specified in the config
    if (message.content.indexOf(config.prefix) !== 0) return;

    // Gather args from the input command
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    // Split the command from the args and assign
    const command = args.shift().toLowerCase();

    // Try to find the file that contains the command specified
    try {
        let commandFile = require(`./src/events/${command}.js`);
        // Run the command
        commandFile.run(client, message, args);
    } catch (err) {
        message.reply("An error occured!");
        logger.error(err);
    }
});

// Log in the bot
client.login(auth.token);
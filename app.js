/* eslint no-unused-vars: 0 */
/* eslint global-require: 0 */
const logger = require('winston');
const auth = require('./auth.json'); // eslint-disable-line import/no-unresolved
const config = require('./config.json');
const db = require('./src/db/db');
const httpServer = require('./src/http/server');
const botClient = require('./src/botClient');

const bot = {
    logger,
    auth,
    config,
    services: {},
};

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true,
});
logger.level = 'debug';

bot.services.database = new db.DB(bot);
bot.services.httpServer = new httpServer.HttpServer(bot);
bot.services.discordClient = new botClient.BotClient(bot);

Object.keys(bot.services).forEach((serviceKey) => {
    bot.services[serviceKey].init();
    bot.services[serviceKey].start();
});

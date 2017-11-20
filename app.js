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
};

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true,
});
logger.level = 'debug';

// Start DB
bot.database = new db.DB(bot);
bot.database.connect().then(() => {
    logger.info('DB Ready');
}).catch(() => {
    logger.error('Failed to connect to ElasticSearch, terminating process.');
    process.exit(1);
});

// load the httpServer
bot.httpServer = new httpServer.HttpServer(bot);
bot.httpServer.start();

bot.client = new botClient.BotClient(bot);
bot.client.init();
bot.client.start();

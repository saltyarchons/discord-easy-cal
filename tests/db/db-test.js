const chai = require('chai');
const assert = chai.assert;
const config = require('../config.test.json');
const db = require('../../src/db/db.js');
const logger = require('winston');

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true,
});
logger.level = 'debug';

const bot = {
    logger,
    config,
};

const database = new db.DB(bot);

describe('Database connection', () => {
    it('should connect successfully', () => {
        database.init();
        return database.start().then((data) => {
            assert.equal(data, 'Connected Successfully', 'Connection works successfully');
        })
    });
});

const elasticsearch = require('elasticsearch');
const logger = require('winston');
const retry = require('retry');

const CALENDAR_INDEX = 'calendar';
const CALENDAR_TYPE = CALENDAR_INDEX;

let client;

function checkAndCreateMissingIndices() {
    client.indices.exists({ index: CALENDAR_INDEX }, (error, exists) => {
        if (error) {
            logger.error(error);
            return;
        }
        if (exists) {
            return;
        }
        client.indices.create({ index: CALENDAR_INDEX }, (err) => {
            // TODO(tree): add actual index mappings
            if (err) {
                logger.error(err);
                return;
            }
            logger.info('Successfully created calendar index');
        });
    });
}

function startup() {
    const operation = retry.operation({
        retries: 5,
        factor: 1,
        minTimeout: 10 * 1000,
    });
    operation.attempt((currentAttempt) => {
        logger.info(`Attempting to connect to elasticsearch (attempt ${currentAttempt}).`);
        client = new elasticsearch.Client({
            host: 'http://elasticsearch:9200',
            log: 'info',
        });
        client.ping({}, (error) => {
            if (operation.retry(error)) {
                logger.warn('Failed to connect to elasticsearch, retrying in 10 seconds.');
                return;
            }
            logger.info('Successfully connected to elasticsearch.');
            checkAndCreateMissingIndices();
        });
    });
}

startup();

module.exports.getAllCalendars = () => {
    return client.search({
        index: CALENDAR_INDEX,
        body: {
            query: {
                match_all: {},
            },
        },
    }).then((result) => {
        return result.hits.hits;
    });
};

module.exports.putCalendar = (calendar) => {
    client.index({
        index: CALENDAR_INDEX,
        type: CALENDAR_TYPE,
        id: calendar.id,
        body: calendar,
    }, (error) => {
        if (error) {
            logger.error(error);
        } else {
            logger.info(`Calendar with ${calendar.id} has successfully been inserted`);
        }
    });
};

module.exports.getCalendarById = (id) => {
    return client.get({
        index: CALENDAR_INDEX,
        type: CALENDAR_TYPE,
        id,
    }).then((result) => {
        return result._source;
    });
};

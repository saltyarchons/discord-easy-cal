const elasticsearch = require('elasticsearch');
const logger = require('winston');
const retry = require('retry');

const CALENDAR_INDEX = 'calendar';
const CALENDAR_TYPE = CALENDAR_INDEX;

exports.DB = class {
    constructor(config) {
        this.config = config;
        this.client = null;
    }

    /**
     * Initiates connection with ElasticSearch. Retries based on what's provided in the config
     * and fails if no connection can be established.
     */
    connect() {
        const operation = retry.operation({
            retries: this.config.db.retry.times,
            factor: this.config.db.retry.factor,
            minTimeout: this.config.db.retry.minTimeoutInSeconds * 1000,
        });

        const result = new Promise((resolve, reject) => {
            operation.attempt((currentAttempt) => {
                logger.info(`Attempting to connect to elasticsearch (attempt ${currentAttempt}).`);
                this.client = new elasticsearch.Client({
                    host: this.config.db.host,
                    log: this.config.db.log,
                });
                this.client.ping({}, (error) => {
                    if (operation.retry(error)) {
                        logger.warn(`Failed to connect to elasticsearch, retrying in ${this.config.db.retry.minTimeoutInSeconds} seconds.`);
                        return;
                    }
                    if (operation.attempts() > this.config.db.retry.times) {
                        reject(error);
                    } else {
                        this.checkAndCreateMissingIndices();
                        resolve('Connected Successfully');
                    }
                });
            });
        });
        return result;
    }

    /**
     * Creates indices for calendar if none exist. Called by success in the connect function.
     */
    checkAndCreateMissingIndices() {
        this.client.indices.exists({ index: CALENDAR_INDEX }, (error, exists) => {
            if (error) {
                logger.error(error);
                return;
            }
            if (exists) {
                return;
            }
            this.client.indices.create({ index: CALENDAR_INDEX }, (err) => {
                // TODO(tree): add actual index mappings
                if (err) {
                    logger.error(err);
                    return;
                }
                logger.info('Successfully created calendar index');
            });
        });
    }

    /**
     * Returns all stored calendars.
     */
    getAllCalendars() {
        return this.client.search({
            index: CALENDAR_INDEX,
            body: {
                query: {
                    match_all: {},
                },
            },
        }).then((result) => {
            return result.hits.hits.map((hit) => { return hit._source; });
        });
    }

    /**
     * Stores the provided calendar in ElasticSearch. Calendars are expected to contain an id.
     * @param {Object} calendar The calendar to store.
     */
    putCalendar(calendar) {
        this.client.index({
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
    }

    /**
     * Loads a calendar by id.
     * @param {String} id The id.
     */
    getCalendarById(id) {
        return this.client.get({
            index: CALENDAR_INDEX,
            type: CALENDAR_TYPE,
            id,
        }).then((result) => {
            return result._source;
        });
    }
};

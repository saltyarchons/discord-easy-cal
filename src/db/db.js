const elasticsearch = require('elasticsearch');

const CALENDAR_INDEX = 'calendar';
const CALENDAR_TYPE = CALENDAR_INDEX;

const client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'info',
});

client.indices.exists({ index: CALENDAR_INDEX }, (error, exists) => {
    if (error) {
        console.error(error);
        return;
    }
    if (exists) {
        return;
    }
    client.indices.create({ index: CALENDAR_INDEX }, (err) => {
        // TODO(tree): add actual index mappings
        if (err) {
            console.error(err);
            return;
        }
        console.log('Successfully created calendar index');
    });
});

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
            console.error(error);
        } else {
            console.log(`Calendar with ${calendar.id} has successfully been inserted`);
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

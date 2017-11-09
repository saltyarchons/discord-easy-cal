const elasticsearch = require('elasticsearch');

const CALENDAR_INDEX = 'calendar';
const CALENDAR_TYPE = CALENDAR_INDEX;

let client = new elasticsearch.Client({
    host: 'localhost:9200', //TODO(tree): make this configurable
    log: 'info'
});

client.indices.exists({index: CALENDAR_INDEX}, (error, exists) => {
    if (error) {
        console.error(error);
        return;
    }
    if (exists) {
        return;
    }
    client.indices.create({index: CALENDAR_INDEX}, (error, data) => {
        // TODO(tree): add actual index mappings
        if (error) {
            console.error(error);
            return;
        }
        console.log('Successfully created calendar index');
    })
});

module.exports.getAllCalendars = () => {
    return client.search({
        index: CALENDAR_INDEX,
        body: {
            query: {
                match_all: {}
            }
        }
    }).then(result => {
        return result.hits.hits;
    })
};

module.exports.putCalendar = (calendar) => {
    if (!('id' in calendar)) {
        throw 'Calendar ' + calendar + ' doesn\'t contain id column';
    }
    client.index({
        index: CALENDAR_INDEX,
        type: CALENDAR_TYPE,
        id: calendar.id,
        body: calendar
    }, (error, response) => {
        if (error) {
            console.error(error);
        } else {
            console.log(`Calendar with ${calendar.id} has successfully been inserted`);
        }

    })
};

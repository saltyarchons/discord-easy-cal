const elasticsearch = require('elasticsearch');

const CALENDAR_INDEX = 'calendara';

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
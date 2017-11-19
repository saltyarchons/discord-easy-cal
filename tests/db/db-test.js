const chai = require('chai');
const assert = chai.assert;
const config = require('../config.test.json');
const db = require('../../src/db/db.js');
const database = new db.DB(config);

describe('ConnectionTest', () => {
    it('Connect should work', () => {
        return database.connect().then((data) => {
            assert.equal(data, 'Connected Successfully', 'Connection works successfully');
        })
    })
});

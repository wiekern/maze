const db = require('../db');

module.exports = db.defineModel('blocklys', {
	name: db.STRING(50),
    code: db.TEXT
});

const db = require('../db');

module.exports = db.defineModel('solutions', {
	name: db.STRING(50)
});

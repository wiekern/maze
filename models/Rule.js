const db = require('../db');


module.exports = db.defineModel('rules', {
	solution_id: db.STRING(50),
    front_side: db.BOOLEAN,
    left_side: db.BOOLEAN,
    right_side: db.BOOLEAN,
    actions: db.STRING(100)
});

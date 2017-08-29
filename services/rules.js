
const ruleSevice = require('../services/rules');
const model = require('../model');

let SolutionModel = model.Solution,
    RuleModel = model.Rule;
RuleModel.belongsTo(SolutionModel, {foreignKey: 'solution_id'});

var id = 0;

function nextId() {
    id++;
    return 'p' + id;
}

function Rule(solution_id, front_side, left_side, right_side, actions) {
	this.id = nextId();
    this.solution_id = solution_id;
    this.front_side = front_side;
    this.left_side = left_side;
    this.right_side = right_side;
    this.actions = actions;
}

module.exports = {
    getRules: async (solution_id) => {
        var rules = await RuleModel.findAll({
            where: {
                solution_id: solution_id
            }
        });
        // for (let p of pets) {
        //     console.log(JSON.stringify(p));
        // }
        return JSON.stringify(rules);
    },

    getRule: (id) => {
        var rule = RuleModel.findAll({
            where: {
                id: id
            }
        });
        return JSON.stringify(rule);
    },

    createRule: async (solution_id, front_side, left_side, right_side, mark, actions) => {
        var now = Date.now();
        var p = await RuleModel.create({
            id: 'd-' + now,
            solution_id: solution_id,
            front_side: front_side,
            left_side: left_side,
            right_side: right_side,
            mark: mark,
            actions: actions,
            createdAt: now,
            updatedAt: now,
            version: 0
        }).catch(function(err) {
            console.log(err);
        });
        return p;
    },

    deleteRule: (id) => {
        var rule = RuleModel.findAll({
            where: {
                id: id
            }
        });
        rule.destory();
        return JSON.stringify(rule);
    }
};
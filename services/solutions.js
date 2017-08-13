const ruleSevice = require('../services/rules');
const model = require('../model');
// RuleModel.belongsTo(SolutionModel, {foreignKey: 'solution_id'});
let SolutionModel = model.Solution,
    RuleModel = model.Rule;

var id = 0;

function nextId() {
    id++;
    return 'p' + id;
}

function Solution(rules) {
    this.id = nextId();
    this.rules = rules;
}

module.exports = {
    getSolutions: async () => {
        var solutions = await SolutionModel.findAll();
        return JSON.stringify(solutions);
    },

    getSolution: (id) => {
        var solution = SolutionModel.findAll({
            where: {
                id: id
            }
        });
        return JSON.stringify(solution);
    },

    createSolution: async (solution) => {
        var now = Date.now();
        var solu = JSON.parse(solution);
        if (!solu) {
            console.log('parse solution failed.');
            return ;
        }

        var p =  await SolutionModel.create({
            // id: 'd-' + now,
            id: nextId(),
            name: solu.name,
            createdAt: now,
            updatedAt: now,
            version: 0
        });

        // console.log('##############' + JSON.stringify(p));
        
        for (var i = 0; i < solu.situations.length; i++) {
            var s = {
                up: true,
                left: true,
                right: true
            };
            if (solu.situations[i] === true) {
                if ((solu.situations[i] >> 3) & 0x01 === 0) {
                    s.up = false;
                }
                if ((solu.situations[i] >> 1) & 0x01 === 0) {
                    s.left = false;
                }
                if (solu.situations[i] & 0x01 === 0) {
                    s.right = false;
                }
                // console.log('solution id:' + p.get('id'));
                ruleSevice.createRule(p.get('id'), s.up, s.left, s.right, solu.actionsList[i]);
            }

        }
        return JSON.stringify(p);;
    },

    deleteSolution: (id) => {
        var solution = SolutionModel.findAll({
            where: {
                id: id
            }
        });
        solution.destory();
        return JSON.stringify(solution);
    }
};
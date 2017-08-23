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

    getSolution: async (name) => {
        var solution = await SolutionModel.findOne({
            where: {
                name: name
            }
        });

        var rules = await ruleSevice.getRules(solution.get('id'));
        var res = {};
        res.name = solution.get('name');
        res.rules = rules;
        // console.log(res);
        return res;
    },

    createSolution: async (solution) => {
        var now = Date.now(), ruleIsEmpty = true;
        var solu = JSON.parse(solution);
        if (!solu) {
            console.log('parse solution failed.');
            return ;
        }

        for (var i = 0; i < solu.situations.length; i++) {
            if (solu.situations[i] === true) {
                ruleIsEmpty = false;
                break;
            }
        }

        if (ruleIsEmpty) {
            console.log('ruleIsEmpty');
            return ;
        }

        var p =  await SolutionModel.create({
            id: 'd-' + now,
            // id: nextId(),
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
                console.log(((i>>3 & 0x01) === 0));
                if (((i >> 3) & 0x01) === 0) {
                    s.up = false;
                }
                if (((i >> 1) & 0x01) === 0) {
                    s.left = false;
                }
                if ((i & 0x01) === 0) {
                    s.right = false;
                }
                // console.log('solution id:' + p.get('id'));
                console.log(s);
                await ruleSevice.createRule(p.get('id'), s.up, s.left, s.right, solu.marks[i], solu.actionsList[i]);
            }

        }
        return JSON.stringify(p);;
    },

    deleteSolution: async (name) => {
        var solution = await SolutionModel.findAll({
            where: {
                name: name
            }
        });
        solution.destory();
        return JSON.stringify(solution);
    }
};
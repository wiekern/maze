const ruleSevice = require('../services/rules');
const userSevice = require('../services/users');
const model = require('../model');
// RuleModel.belongsTo(SolutionModel, {foreignKey: 'solution_id'});
let SolutionModel = model.Solution,
    RuleModel = model.Rule;
    UserModel = model.User;
    
SolutionModel.belongsTo(UserModel, {foreignKey: 'userId'});


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
    getSolutions: async (username) => {

        var user = await UserModel.findOne({
            where: {
                name: username
            }
        });
        if (!user) {
            return JSON.stringify({ok: false, msg: 'user not existed.'});
        }

        var solutions = await SolutionModel.findAll({
            where: {
                userId: user.get('id')
            }
        });

        if (solutions.length !== 0) {
            return JSON.stringify({ok: true, msg: 'solutions returned.', res: solutions});
        } else {
            return JSON.stringify({ok: false, msg: 'no solutions.'});
        }
    },

    getSolution: async (name, username) => {

        var user = await UserModel.findOne({
            where: {
                name: username
            }
        });

        if (!user) {
            return JSON.stringify({ok: false, msg: 'user not existed.'});
        }

        var solution = await SolutionModel.findOne({
            where: {
                name: name,
                userId: user.get('id')
            }
        });

        if (!solution) {
            return JSON.stringify({ok: false, msg: 'solution not found.'});
        }

        var rules = await ruleSevice.getRules(solution.get('id'));
        if (!rules) {
            return JSON.stringify({ok: false, msg: 'no rules of this solution.'});
        }

        var res = {};
        res.name = solution.get('name');
        res.rules = rules;

        return JSON.stringify({ok: true, msg: 'solution returned.', res: res});
    },

    createSolution: async (solution, username) => {
        var now = Date.now(), ruleIsEmpty = true;
        var solu = JSON.parse(solution);
        if (!solu) {
            return JSON.stringify({ok: true, msg: 'parse solution failed'});
        }

        for (var i = 0; i < solu.situations.length; i++) {
            if (solu.situations[i] === true) {
                ruleIsEmpty = false;
                break;
            }
        }

        if (ruleIsEmpty) {
            return JSON.stringify({ok: false, msg: 'rule is empty.'});
        }

        var user = await UserModel.findOne({
            where: {
                name: username
            }
        });

        if (!user) {
            return JSON.stringify({ok: false, msg: 'user not existed.'});
        }

        var p =  await SolutionModel.create({
            id: 'd-' + now,
            name: solu.name,
            userId: user.get('id'),
            createdAt: now,
            updatedAt: now,
            version: 0
        }).catch(function(err) {
            return JSON.stringify({ok: false, msg: 'create solution failed.'});
        });
            
        
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
                var rule = await ruleSevice.createRule(p.get('id'), s.up, s.left, s.right, solu.marks[i], solu.actionsList[i]);
                if (!rule) {
                    p.destory();
                    return JSON.stringify({ok: false, msg: 'created rules failed.'});
                }
            }

        }
        return JSON.stringify({ok: true, msg: 'solution created.', res: p});
    },

    deleteSolution: async (name, username) => {

        var user = await UserModel.findOne({
            where: {
                name: username
            }
        });
        if (!user) {
            return JSON.stringify({ok: false, msg: 'user not existed.'});
        }

        var solution = await SolutionModel.findAll({
            where: {
                name: name,
                userId: user.get('id') 
            }
        });
        solution.destory();
        return JSON.stringify({ok: true, msg: 'solution deleted.', res: solution});
    }
};
const userSevice = require('../services/users');
const model = require('../model');
// RuleModel.belongsTo(SolutionModel, {foreignKey: 'solution_id'});
let BlocklyModel = model.Blockly,
    UserModel = model.User;

BlocklyModel.belongsTo(UserModel, {foreignKey: 'userId'});

var id = 0;

function nextId() {
    id++;
    return 'p' + id;
}

function Blockly(code) {
    this.id = nextId();
    this.code = code;
}

module.exports = {
    getBlocklys: async (username) => {

        var user = await UserModel.findOne({
            where: {
                name: username
            }
        });
        if (!user) {
            return JSON.stringify({ok: false, msg: 'user not existed.'});
        }

        var solutions = await BlocklyModel.findAll({
            where: {
                userId: user.get('id')
            }
        });

        if (solutions.length !== 0) {
            return JSON.stringify({ok: true, msg: 'solutions of blockly returned.', res: solutions});
        } else {
            return JSON.stringify({ok: false, msg: 'no solutions of blockly.'});
        }
    },

    getBlockly: async (name, username) => {
        var errMsg = null;
        var user = await UserModel.findOne({
            where: {
                name: username
            }
        });
        if (!user) {
            return JSON.stringify({ok: false, msg: 'user not existed.'});
        }

        var solution = await BlocklyModel.findOne({
            where: {
                name: name,
                userId: user.get('id')
            }
        }).catch(function(err) {
            errMsg = 'solution of block not found.';
        });

        if (errMsg) {
            return JSON.stringify({ok: false, msg: errMsg});
        } else {
            return JSON.stringify({ok: true, msg: 'soluton of Blockly returned.', res: solution});
        }
    },

    createBlockly: async (solution, username) => {
        var now = Date.now(), errMsg = null;
        var solu = JSON.parse(solution);
        if (!solu) {
            console.log('parse solution failed.');
            return JSON.stringify({ok: false, msg: 'parse solution failed'});
        }

        var user = await UserModel.findOne({
            where: {
                name: username
            }
        });
        if (!user) {
            return JSON.stringify({ok: false, msg: 'user not existed.'});
        }

        var p =  await BlocklyModel.create({
            id: 'd-' + now,
            name: solu.name,
            code: solu.code,
            userId: user.get('id'),
            createdAt: now,
            updatedAt: now,
            version: 0
        }).catch(function(err) {
            errMsg = 'create solution of blockly failed.'
            
        });

        if (errMsg) {
            return JSON.stringify({ok: false, msg: errMsg});
        } else {
            return JSON.stringify({ok: true, msg: 'soluton of Blockly saved.', res: p});
        }

    },

    deleteBlockly: async (name) => {
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
        return JSON.stringify({ok: true, msg: 'soluton of Blockly deleted.', res: solution});
    }
};
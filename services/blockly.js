const model = require('../model');
// RuleModel.belongsTo(SolutionModel, {foreignKey: 'solution_id'});
let BlocklyModel = model.Blockly;

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
    getBlocklys: async () => {
        var solutions = await BlocklyModel.findAll();
        return JSON.stringify(solutions);
    },

    getBlockly: async (name) => {
        var solution = await BlocklyModel.findOne({
            where: {
                name: name
            }
        });

        return JSON.stringify(solution);
    },

    createBlockly: async (solution) => {
        var now = Date.now();
        var solu = JSON.parse(solution);
        // console.log(solu);
        if (!solu) {
            console.log('parse solution failed.');
            return ;
        }

        var p =  await BlocklyModel.create({
            id: 'd-' + now,
            // id: nextId(),
            name: solu.name,
            code: solu.code,
            createdAt: now,
            updatedAt: now,
            version: 0
        });

        // console.log('##############' + JSON.stringify(p));
    
        return JSON.stringify(p);;
    },

    deleteBlockly: async (name) => {
        var solution = await SolutionModel.findAll({
            where: {
                name: name
            }
        });
        solution.destory();
        return JSON.stringify(solution);
    }
};
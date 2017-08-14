const solutions = require('../services/solutions');
const rules = require('../services/rules');
const blocklys = require('../services/blockly');

const APIError = require('../middlewares/rest').APIError;


module.exports = {
    'GET /api/solutions': async (ctx, next) => {
        ctx.rest({
            solutions: await solutions.getSolutions()
        });
    },

    'GET /api/solutions/:name': async (ctx, next) => {
        ctx.rest({
            solution: await solutions.getSolution(ctx.params.name)
        });
    },

    'POST /api/solutions': async (ctx, next) => {
        var p = await solutions.createSolution(ctx.request.body.solution);
        // console.log(p);
        ctx.rest(p);
    },

    'DELETE /api/solutions/:name': async (ctx, next) => {
        console.log(`delete solution ${ctx.params.name}...`);
        var p = await solutions.deleteSolution(ctx.params.name);
        if (p) {
            ctx.rest(p);
        } else {
            throw new APIError('solution:not_found', 'solution not found by id.');
        }
    },

    'GET /api/rules': async (ctx, next) => {
        ctx.rest({
            rules: await rules.getRules()
        });
    },

    'POST /api/rules': async (ctx, next) => {
        var p = await rules.createRule(ctx.request.body.name, ctx.request.body.manufacturer, parseFloat(ctx.request.body.price));
        ctx.rest(p);
    },

    'DELETE /api/rules/:id': async (ctx, next) => {
        console.log(`delete rule ${ctx.params.id}...`);
        var p = await rules.deleteRule(ctx.params.id);
        if (p) {
            ctx.rest(p);
        } else {
            throw new APIError('rule:not_found', 'rule not found by id.');
        }
    },

    'GET /api/blocklys': async (ctx, next) => {
        ctx.rest({
            solutions: await blocklys.getBlocklys()
        });
    },

    'GET /api/blocklys/:name': async (ctx, next) => {
        ctx.rest({
            solution: await blocklys.getBlockly(ctx.params.name)
        });
    },

    'POST /api/blocklys': async (ctx, next) => {
        var p = await blocklys.createBlockly(ctx.request.body.solution);
        // console.log(p);
        ctx.rest(p);
    },

    'DELETE /api/blocklys/:name': async (ctx, next) => {
        console.log(`delete solution ${ctx.params.name}...`);
        var p = await blocklys.deleteBlockly(ctx.params.name);
        if (p) {
            ctx.rest(p);
        } else {
            throw new APIError('blockly solution:not_found', 'blockly solution not found by name.');
        }
    },

};


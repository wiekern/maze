const solutions = require('../services/solutions');
const rules = require('../services/rules');
const blocklys = require('../services/blockly');
const users = require('../services/users');

const APIError = require('../middlewares/rest').APIError;


module.exports = {
    'GET /api/solutions': async (ctx, next) => {
        ctx.rest(await solutions.getSolutions(ctx.query.username));
    },

    'GET /api/solutions/:name': async (ctx, next) => {
        ctx.rest(await solutions.getSolution(ctx.params.name, ctx.query.username));
    },

    'POST /api/solutions': async (ctx, next) => {
        var p = await solutions.createSolution(ctx.request.body.solution, ctx.request.body.username);
        ctx.rest(p);
    },

    'DELETE /api/solutions/:name': async (ctx, next) => {
        console.log(`delete solution ${ctx.params.name}...`);
        var p = await solutions.deleteSolution(ctx.params.name, ctx.request.body.username);
        if (p) {
            ctx.rest(p);
        } else {
            throw new APIError('solution:not_found', 'solution not found by id.');
        }
    },

    'GET /api/blocklys': async (ctx, next) => {
        var p = await blocklys.getBlocklys(ctx.query.username);
        if (p) {
            ctx.rest(p);
        } else {
            throw new APIError('blockly:getBlocklys', 'getBlocklys failed.');
        }

    },

    'GET /api/blocklys/:name': async (ctx, next) => {
        var p = await blocklys.getBlockly(ctx.params.name, ctx.query.username);
        if (p) {
            ctx.rest(p);
        } else {
            throw new APIError('blockly:getBlockly', 'getBlockly failed.');
        }
    },

    'POST /api/blocklys': async (ctx, next) => {
        var p = await blocklys.createBlockly(ctx.request.body.solution, ctx.request.body.username);
        // console.log(p);
        ctx.rest(p);
    },

    'DELETE /api/blocklys/:name': async (ctx, next) => {
        console.log(`delete solution ${ctx.params.name}...`);
        var p = await blocklys.deleteBlockly(ctx.params.name, ctx.request.body.username);
        if (p) {
            ctx.rest(p);
        } else {
            throw new APIError('blockly solution:not_found', 'blockly solution not found by name.');
        }
    },

    'GET /api/users': async (ctx, next) => {
        ctx.rest(await users.getUsers());
    },

    'GET /api/users/:name': async (ctx, next) => {
        ctx.rest(await users.getUser(ctx.params.name));
    },

    'POST /api/users/validate': async (ctx, next) => {
        var p = await users.validateUser(ctx.request.body.user);
        // console.log(p);
        if (p.res) {
            console.log(p.res);
            ctx.session.user = p.res;
        }
        ctx.rest(p);
    },

    'POST /api/users': async (ctx, next) => {
        var p = await users.createUser(ctx.request.body.user);
        // console.log(p);
        ctx.rest(p);
    },

    'DELETE /api/users/:name': async (ctx, next) => {
        console.log(`delete user ${ctx.params.name}...`);
        var p = await users.deleteUser(ctx.params.name);
        if (p) {
            ctx.rest(p);
        } else {
            throw new APIError('user:not_found', 'user not found by id.');
        }
    }

};



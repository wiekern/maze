const nunjucks = require('nunjucks');

function createEnv(path, opts) {
	var autoescape = opts.autoescape && true,
		noCache = opts.noCache || false,
		watch = opts.watch || false,
		throwOnundefined = opts.throwOnundefined || false,
		env = new nunjucks.Environment(
			new nunjucks.FileSystemLoader(path, {
				noCache: noCache,
				watch: watch
			}), {
				autoescape: autoescape,
				throwOnundefined: throwOnundefined
			});

	if (opts.filters) {
		for (var f in opts.filters) {
			env.addFilter(f, opts.filter[f]);
		}
	}
	return env;
}

// path: 'views'
function templating(path, opts) {
	var env = createEnv(path, opts);
	return async (ctx, next) => {
		ctx.render = function (view, model) {
			ctx.response.body = env.render(view, Object.assign({}, ctx.state || {}, model || {}));
			ctx.response.type = 'text/html';
		};
		await next();
	};
}

module.exports = templating;
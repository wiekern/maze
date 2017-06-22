const Koa = require('koa');
const router = require('koa-router')();
const bodyParser = require('koa-bodyparser');
const controller = require('./controller')
const templating = require('./templating');

const isProduction = process.env.NODE_ENV === 'production';

const app = new Koa();

app.use(async (ctx, next) => {
	console.log(`Process ${ctx.request.method} ${ctx.request.url}`);
	var start = new Date().getTime(),
		execTime;
	await next();
	execTime = new Date().getTime() - start;
	ctx.response.set('X-Response-Time', `${execTime}`);
});

// load static files
if (!isProduction) {
	let staticFiles = require('./static-files');
	app.use(staticFiles('/static/', __dirname + '/static'));
}

// parse body of POST request
app.use(bodyParser());
// render view
app.use(templating('views', {
	noCache: !isProduction,
	watch: !isProduction
}));
// routes
app.use(controller());

app.listen(3000);
console.log('http://localhost:3000');


















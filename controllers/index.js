
var fn_index = async (ctx, next) => {
	ctx.render('index.html', {username: ctx.query.username});
};

var fn_login = async (ctx, next) => {
	// check user name
	ctx.render('login.html', {});
};

module.exports = {
	'GET /': fn_login,
	'GET /index': fn_index
};
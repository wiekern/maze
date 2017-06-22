var fn_index = async (ctx, next) => {
	ctx.render('index.html', {});
};

module.exports = {
	'GET /': fn_index
};
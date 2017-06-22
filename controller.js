const fs = require('fs');

function addMapping(router, dir) {
	var files = fs.readdirSync(__dirname + '/' + dir);
	var js_files = files.filter((f) => {
		return f.endsWith('.js');
	});

	for (var f of js_files) {
		let mapping = require(__dirname + '/controllers/' + f);
		for (var url in mapping) {
			if (url.startsWith('GET ')) {
				var path = url.substring(4);
				router.get(path, mapping[url]);
				console.log(`register URL mapping: GET ${path}`);
			} else if (url.startsWith('POST ')) {
				var path = url.substring(5);
				router.post(path, mapping[path]);
			} else {
				console.log(`invalid URL: ${url}`);
			}
		}
	}
}

module.exports = function (dir) {
	let 
		controllers_dir = dir || 'controllers',
		router = require('koa-router')();
		addMapping(router, controllers_dir);
		return router.routes();
}
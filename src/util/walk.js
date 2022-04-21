const fs = require('node:fs');

/**
 * @param {fs.PathLike} path
 */
module.exports = function* walk(
	path,
	cb = (/** @type {string} */ f) => f.endsWith('.js')
) {
	for (const file of fs.readdirSync(path)) {
		const stat = fs.statSync(`${path}/${file}`);

		if (stat.isDirectory()) {
			yield* walk(`${path}/${file}`, cb);
		} else {
			if (cb(file)) {
				yield [file.replace(/\.js$/gi, ''), require(`${path}/${file}`)];
			}
		}
	}
};

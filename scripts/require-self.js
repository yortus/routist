var fs = require('fs');
var path = require('path');

// Create the pseudo-module's main file and typings file.
fs.writeFileSync(path.join(__dirname, '../node_modules/routist.js'), `module.exports = require('..');`);
fs.writeFileSync(path.join(__dirname, '../node_modules/routist.d.ts'), `export * from '..';`);

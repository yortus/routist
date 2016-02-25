var fs = require('fs');
var path = require('path');


// Add routist.js and routist.d.ts to routist's own node_modules folder, so it can require() itself (e.g. in tests).
fs.writeFileSync(path.join(__dirname, '../node_modules/routist.js'), `module.exports = require('..');`);
fs.writeFileSync(path.join(__dirname, '../node_modules/routist.d.ts'), `export * from '..';`);

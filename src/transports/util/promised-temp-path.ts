'use strict';
import * as path from 'path';
import * as fs from './fs';
var findRoot = require('find-root');





// TODO: Ensure we have a 'temp' directory to put bundles into. Do this only once...
// TODO: better place for temp path? use system temp settings?
// TODO: how/when to flush files placed in here?
export default (() => {
    var tempPath = path.join(findRoot(), '../temp'); // place temp dir within app dir.
    return fs.mkdirp(tempPath).then(() => tempPath);
})();

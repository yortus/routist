'use strict';
import * as assert from 'assert';
import * as http from 'http';
import * as path from 'path';
import {makeHttpListener, RuleSet, UNHANDLED} from 'routist';
let stackTrace = require('stack-trace');





function F(strings: string[], ...values: any[]) {

    // TODO: temp just for now... implement more general approach...    
    assert(strings.length === 1);
    assert(values.length === 0);

    // TODO: ...
    let relPath = strings[0];
    if (relPath.charAt(0) !== '.') return relPath;

    // TODO: ...
    let callerFilename = stackTrace.get()[1].getFileName();
    let callerDirname = path.dirname(callerFilename);
    let absPath = path.join(callerDirname, relPath);
    return absPath;
}





// TODO: ...
function file(absPath: string) {
    return () => ({file: absPath});
}
function json(obj: any) {
    return () => ({json: obj});
}
function html(str: string) {
    return () => ({html: str});
}
function bundle(x) {
    return ($next) => {
        debugger;

        let res = $next();
        return res === UNHANDLED ? {json: [x]} : {json: [x].concat(res.json)};
    };
}





let ruleSet = new RuleSet({
    'GET /foo':             html('foo'),
    'GET /bar':             json({bar: 'bar'}),
    'GET /lodash.js':       file(F`../../../node_modules/lodash/lodash.js`),
    'GET /lodash-all.js':   () => ({bundle: `V:/oss/routist/node_modules/lodash/_*.js`}),

    'GET /aaa #1': bundle('111'),
    'GET /aaa #2': bundle('222'),



    '...':                  html('fallback')
});
let httpListener = makeHttpListener(ruleSet);





let httpServer = http.createServer(httpListener);
httpServer.listen(1337);
console.log(`Web server listening on port ${1337}`);

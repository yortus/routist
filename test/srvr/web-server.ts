'use strict';
import * as http from 'http';
import {makeHttpListener, RuleSet} from 'routist';





let ruleSet = new RuleSet({
    '/foo': () => ({html: 'foo'}),
    '/bar': () => ({json: {bar: 'bar'}}),
    '/lodash.js': () => ({file: `V:/oss/routist/node_modules/lodash/lodash.js`}),
    '/lodash-all.js': () => ({bundle: `V:/oss/routist/node_modules/lodash/_*.js`}),
    '...': () => ({html: 'fallback'})
});
let httpListener = makeHttpListener(ruleSet);





let httpServer = http.createServer(httpListener);
httpServer.listen(1337);
console.log(`Web server listening on port ${1337}`);

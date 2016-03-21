'use strict';
import * as assert from 'assert';
import * as http from 'http';
import * as path from 'path';
import {makeHttpListener, RuleSet, UNHANDLED} from 'routist';
import {F, file, bundle, json, html} from 'routist';
let stackTrace = require('stack-trace');





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

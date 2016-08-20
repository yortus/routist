import * as assert from 'assert';
import * as http from 'http';
import * as path from 'path';
import {makeHttpListener, PatternMatchingFunction, UNHANDLED} from 'routist';
import {file, bundle, json, html} from 'routist';
let stackTrace = require('stack-trace');





let ruleSet = new PatternMatchingFunction({

    'GET /*.js': html('*.js'), // catch all .js files
    'GET /test.*': html('test.*'), // catch all test files
    'GET /test.js': html('test.js'), // cover the overlap, but it doesn't cover the overlap b/c there's also test.*.js matching both prev patterns


    'GET /foo':             html('foo'),
    'GET /bar':             json({bar: 'bar'}),
    'GET /lodash.js':       file('routist/node_modules/lodash/lodash.js'),
    'GET /lodash-all.js':   bundle('routist/node_modules/lodash/_*.js'),

    'GET /aaa.js #1':       bundle('routist/package.json'),
    'GET /aaa.js #2':       bundle('routist/LICENSE'),



    '...':                  html('fallback')
});
let httpListener = makeHttpListener(ruleSet);





let httpServer = http.createServer(httpListener);
httpServer.listen(1337);
console.log(`Web server listening on port ${1337}`);





let ruleSet2 = {

    // TODO: note to self after talking with Carl (8/8/2016)

    // (1) can't express this: (but why in practice would you do this? is this a realistic use case?)    
    'GET /*.js': html('*.js'), // catch all .js files
    'GET /test.*': html('test.*'), // catch all test files
    'GET /test.js': html('test.js'), // cover the overlap, but it doesn't cover the overlap b/c there's also test.*.js matching both prev patterns
    //'GET /test.*.js': html('test.js'), // adding this doesn't solve the problem, because Pattern#interect just can't intersect the first two patterns


    // (2) this works, but crashes only when an ambigious route like aaa/bbb.js is *accessed*
    // wouldn't it be better if we worked out at the time of route table construction that there
    // are ambiguous overlaps and report them early (and how to fix it by adding a route)? Or at least a switch?
    'GET /aaa/...': html('*ab'), // catch everything starting with /aaa/...
    'GET /....js': html('a/b'),   // catch all .js files
    
};

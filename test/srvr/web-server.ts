'use strict';
import * as http from 'http';
import {makeHttpListener, RuleSet} from 'routist';





let ruleSet = new RuleSet({
    '/foo': () => 'foo',
    '/bar': () => 'bar',
    '...': () => 'fallback'
});
let httpListener = makeHttpListener(ruleSet);





let httpServer = http.createServer(httpListener);
httpServer.listen(1337);
console.log(`Web server listening on port ${1337}`);

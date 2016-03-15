'use strict';
import * as http from 'http';
import * as url from 'url';
import RuleSet, {UNHANDLED} from '../rule-set';
// TODO: set TReq, TRes type args on RuleSet...




export function makeHttpListener(ruleSet: RuleSet<any, any>) {

    return (httpReq: http.IncomingMessage, httpRes: http.ServerResponse) => {
        console.log('request received'); // TODO: remove...


        // TODO: make address...
        // - method
        // - pathname
        // - NO hostname/port
        // - NO querystring
        let method = httpReq.method;
        let urlParts = url.parse(httpReq.url);
        let pathname = urlParts.pathname;
        let address = `${pathname}`;
        //TODO: was... restore... let address = `${method} ${pathname}`;

        // TODO: make request...
        let request = {
            // TODO: ...?
        };


        // TODO: generate response...
        // TODO: what if promise?
        let response = ruleSet.execute(address, request);


        // TODO: respond over HTTP...
        if (response === UNHANDLED) {
            httpRes.writeHead(404, 'not found');
            httpRes.end();
        }
        else {
            httpRes.statusCode = 200;
            httpRes.write(response);
            httpRes.end();
        }
    };
}

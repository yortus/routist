'use strict';
import * as http from 'http';
import * as url from 'url';
import RuleSet from '../rule-set';
// TODO: set TReq, TRes type args on RuleSet...




export function makeListener(ruleSet: RuleSet<any, any>) {

    return (httpReq: http.IncomingMessage, httpRes: http.ServerResponse) => {


        // TODO: make address...
        // - method
        // - pathname
        // - NO hostname/port
        // - NO querystring
        let method = httpReq.method;
        let urlParts = url.parse(httpReq.url);
        let pathname = urlParts.pathname;
        let address = `${method} ${pathname}`;

        // TODO: make request...
        let request = {
            // TODO: ...?
        };


        // TODO: generate response...


        // TODO: respond over HTTP...


    };
}

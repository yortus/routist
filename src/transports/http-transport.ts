'use strict';
import * as crypto from 'crypto';
import * as http from 'http';
import * as path from 'path';
import * as url from 'url';
import * as zlib from 'zlib';
import * as _ from 'lodash'; // TODO: remove this dep? What do we need from it? Bring it into 'util'...
import {async, await} from 'asyncawait'; // TODO: these are devDeps!! remove from this prod code!!
import RuleSet, {UNHANDLED} from '../rule-set';
import {isPromiseLike} from '../util';
import * as fs from './util/fs';
import promisify from './util/promisify';
import promisedTempPath from './util/promised-temp-path';
import {getBundleFilename} from './util/file-bundling';
import * as sessionCookie from './util/session-cookie';
let jsonBody = <(req) => Promise<any>> promisify(require('body/json'));
let formBody = <(req) => Promise<any>> promisify(require('body/form'));
let textBody = <(req) => Promise<any>> promisify(require('body'));
let is = require('type-is');
let nodeStatic = require('node-static');
let gzip = <(text: string) => Promise<Buffer>> promisify(zlib.gzip);





// TODO: doc...
// TODO: review - copied from httpExchange...
// TODO: which of the below belong in a transport-agnostic logical request structure?
//       - definitely not headers...
export interface Request {


    /** The HTTP method (GET, POST, etc). Always uppercase. */
    method: any;


    /** The full lowercased host portion of the URL, including port information. */
    host: string;


    /** The portion of the request URL that comes after the host and before the query. Always starts with a slash. */
    pathname: string;


    /** An object holding the names and values parsed from the URL's querystring. */
    query: { [name: string]: string; };


    /** Map of request header name/value pairs. Header names are all lowercase. */
    headers: { [name: string]: string; };


    // TODO: ...
    session: any;
}





// TODO: doc...
// TODO: review - copied from httpExchange...
// TODO: which of the below belong in a transport-agnostic logical response structure?
//       - definitely not headers, statusCode...
export interface Response {
    html?: string;
    json?: any;
    file?: string | string[];
    bundle?: string | string[];
    error?: Error | { message: string; };
    statusCode?: number;
    headers?: { [name: string]: string; };
}





export function makeHttpListener(ruleSet: RuleSet<Request, Response>) {

    return <any> async ((httpReq: http.IncomingMessage, httpRes: http.ServerResponse) => {
        console.log('request received'); // TODO: remove...

        // TODO: make address...
        // - method
        // - pathname
        // - NO hostname/port
        // - NO querystring
        let method = httpReq.method;
        let urlParts = url.parse(httpReq.url, true);
        let pathname = urlParts.pathname;
        let address = `${method} ${pathname}`;
        let session = sessionCookie.loadFromRequest(httpReq, httpRes);
        let originalSession = _.cloneDeep(session);


        // TODO: make request...
        let request: Request = {
            method,
            host: httpReq.headers.host,
            pathname,
            query: <any> urlParts.query,
            headers: httpReq.headers,
            session
        };


        // TODO: generate response...
        // TODO: what if promise?
        let rawResponse = ruleSet.execute(address, request);
        let response = isPromiseLike(rawResponse) ? await (rawResponse) : rawResponse;


        // Only update cookie if it was changed.
        if (!_.isEqual(request.session, originalSession)) {
            sessionCookie.saveToResponse(httpReq, httpRes, request.session);
        }


        // TODO: respond over HTTP...
        if (response === UNHANDLED) {
            httpRes.writeHead(404, 'Not found');
            httpRes.end();
        }
        else {
            emitResponse(response, httpReq, httpRes);
        }
    });
}





// TODO: ...
// TODO: uses await - therefore must be called from witin an async function...
function emitResponse(response: Response, httpReq: http.IncomingMessage, httpRes: http.ServerResponse) {

    // Validate data object.
    if (!_.isObject(response)) throw new Error('http-transport: invalid response object');

    // Handle JSON responses.
    if (response.json) {
        let headers = response.headers || {};
        _.assign(headers, {'Content-Type': 'application/json'});
        _.assign(headers, {'Cache-Control': 'no-cache'}); // TODO: provide caching options?
        httpRes.writeHead(response.statusCode || 200, headers);
        httpRes.end(JSON.stringify(response.json));
    }

    // Handle HTML responses.
    else if (response.html) {
        let headers = response.headers || {};
        _.assign(headers, {'Content-Type': 'text/html'});
        _.assign(headers, {'Cache-Control': 'no-cache'}); // TODO: provide caching options?
        httpRes.writeHead(response.statusCode || 200, headers);
        httpRes.end(response.html);
    }

    // Handle Error responses.
    else if (response.error) {
        let headers = response.headers || {};
        _.assign(headers, {'Content-Type': 'text/html'});
        _.assign(headers, {'Cache-Control': 'no-cache'}); // TODO: provide caching options?
        httpRes.writeHead(response.error['statusCode'] || response.statusCode || 500, headers);
        httpRes.end(response.error.message);
        //TODO: if NOT in debug mode, sanitise the returned message/info
        //TODO: if in debug mode, include a pretty stack trace
    }

    // Handle file responses.
    else if (response.file) {
        let paths = (<string[]> (_.isArray(response.file) ? response.file : [response.file])).map(path.normalize);
        let absPath = _.find(paths, path => await (fs.exists(path)));
        if (!absPath) return UNHANDLED;
        respondWithGzippedFile(absPath, response.headers, httpReq, httpRes);
    }

    // Handle bundle responses.
    else if (response.bundle) {
        let globs = (<string[]> (_.isArray(response.bundle) ? response.bundle : [response.bundle])).map(path.normalize);
        let absPath = await (getBundleFilename(globs));
        respondWithGzippedFile(absPath, response.headers, httpReq, httpRes);
    }

    else {
        throw new Error(`http-transport: unrecognised response object: ${JSON.stringify(response)}`);
    }
}





// TODO: make cache behaviour configurable (eg no-cache if !!config.debug)
let staticFileServer = new nodeStatic.Server(__dirname, { cache: 1 });





// TODO: copypasta-ish from fileBundling.ts
// TODO: what if there was a hash collision? Wrong bundle/file may be served. Investigate risks & implications.
let getFilePathHashCode = async ((filepath: string): string => {
    let stats = await (fs.stat(filepath));
    let hash = crypto.createHash('md5');
    hash.update(filepath);
    hash.update(stats.mtime.getTime().toString());
    let result = hash.digest('hex');
    return result;
});





// TODO: temp testing...
let getGZippedFileContents = async ((filepath: string): Buffer => {
    let text = await (fs.readFile(filepath, null));
    let result = await (gzip(text));
    return result;
});





// TODO: temp testing...
let respondWithGzippedFile = async ((filepath: string, headers: {}, httpReq: http.IncomingMessage, httpRes: http.ServerResponse) => {

    let ext = path.extname(filepath);
    let hashCode = await (getFilePathHashCode(filepath));
    let outPath = path.join(await (promisedTempPath), hashCode + ext);

    if (!await (fs.exists(outPath))) {
        let contents = await (getGZippedFileContents(filepath));
        await (fs.writeFile(outPath, contents, null));
    }

    let relPath = path.relative(__dirname, outPath);
    headers = headers || {};
    headers['Content-Encoding'] = 'gzip';
    staticFileServer.serveFile(relPath, 200, headers, httpReq, httpRes);
});

'use strict';
import * as assert from 'assert';
import * as path from 'path';
import {UNHANDLED} from '../rule-set';
let findRoot = require('find-root');
let stackTrace = require('stack-trace');





// Idea for commemorative sausage:
'/path/to/{name}.{ext}'.split(/(?:^|})[^{]*(?:$|{)/).filter(s => !!s); // ['name', 'ext']





// TODO: ...
export function F(strings: string[], ...values: any[]) {

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
export function P(strings: string[], ...values: any[]) {

    // TODO: temp just for now... implement more general approach...    
    assert(strings.length === 1);
    assert(values.length === 0);

    // TODO: ...
    let relPath = strings[0];
    assert(relPath.charAt(0) === '.');

    // TODO: ...
    let callerFilename = stackTrace.get()[1].getFileName();
    let callerDirname = path.dirname(callerFilename);
    let packageDirname = findRoot(callerDirname);
    let absPath = path.join(packageDirname, relPath);
    return absPath;
}





// TODO: ...
export function file(absPath: string) {
    return () => ({file: absPath});
}





// TODO: ...
export function json(obj: any) {
    return () => ({json: obj});
}





// TODO: ...
export function html(str: string) {
    return () => ({html: str});
}





// TODO: ...
export function bundle(x) {
    return ($next) => {
        let res = $next();

        if (res === UNHANDLED) {
            return {bundle: [x]};
        }

        assert(Array.isArray(res.bundle));
        return {bundle: [x].concat(res.bundle)};
    };
}

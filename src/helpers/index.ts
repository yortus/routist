'use strict';
import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import {UNHANDLED} from '../rule-set';
let stackTrace = require('stack-trace');





// TODO: ... remove?
// export function F(strings: string[], ...values: any[]) {

//     // Make up the final string.
//     let str = strings.reduce((final, s, i) => final + s + (i < values.length ? values[i] : ''), '');

//     // TODO: ...
//     let relPath = str;
//     if (relPath.charAt(0) !== '.') return relPath;

//     // TODO: ...
//     let callerFilename = stackTrace.get()[1].getFileName();
//     let callerDirname = path.dirname(callerFilename);
//     let absPath = path.join(callerDirname, relPath);
//     return absPath;
// }





// TODO: ...
export function json(obj: any) {
    return () => ({json: obj});
}





// TODO: ...
export function html(str: string) {
    return () => ({html: str});
}





// TODO: ...
export function file(absOrRelPath: string) {
    return fileOrBundle('file', absOrRelPath, getDirnameOfCaller());
}





// TODO: ...
export function bundle(absOrRelPath: string) {
    return fileOrBundle('bundle', absOrRelPath, getDirnameOfCaller());
}





// TODO: ...
// TODO: make lookup of the `absOrRelPath` file closely follow node's module lookup algorithm, but additionally
//       able to resolve this-package-relative module IDs. E.g., if the current module is called 'mylib', and jquery' is
//       installed as a dependency, and the current file is mylib/src/foo/bar.js, then any of the following module IDs
//       would resolve to the same filename:
//       1. '../../node_modules/jquery/dist/jquery.min.js'
//       2. 'mylib/node_modules/jquery/dist/jquery.min.js'
//       3. 'jquery/dist/jquery.min.js'
export function fileOrBundle(type: 'file' | 'bundle', absOrRelPath: string, callerDirname: string) {

    // TODO: ...
    let absPath: string;
    if (absOrRelPath[0] === '.') {
        absPath = path.join(callerDirname, absOrRelPath);
    }
    else {
        let moduleId = absOrRelPath.split(/\/|\\/)[0];
        if (isNpmModuleIdentifier(moduleId)) {
            let packagePath = findPackagePath(moduleId, callerDirname);
            absPath = path.join(packagePath, '..', absOrRelPath);
        }
        else {
            absPath = absOrRelPath;
        }
    }

    // TODO: ensure captureNames are valid JS indentifiers
    let captureNames = absPath.split(/(?:^|})[^{]*(?:$|{)/).filter(s => !!s);

    // TODO: ...
    let UNH = UNHANDLED; // local alias (UNHANDLED as a module export so be renamed locally by TS)
    let template = JSON.stringify(absPath).slice(1, -1).replace(/{/g, '${');
    let source = `(${['$next'].concat(captureNames)}) => {
        let res = $next();
        if (res === UNH) return {[type]: [\`${template}\`]};
        assert(type in res); // all responses must be of the same 'type'
        return {[type]: [\`${template}\`].concat(res[type])};
    }`;
    let handler = eval(`(${source})`);
    return handler;
}





// TODO: temp testing...
function findPackagePath(moduleId: string, fromPath: string) {

    while (true) {
        let pkgPath = path.join(fromPath, 'package.json');
        let pkg = null;
        try {
            pkg = require(pkgPath);
        }
        catch (ex) {}

        if (pkg) {
            assert(pkg.name === moduleId, 'module name mismatch');
            return fromPath;
        }

        let parentPath = path.join(fromPath, '..');
        assert(parentPath !== fromPath, 'module not found');
        fromPath = parentPath;
    }
}





// TODO: temp testing...
function getDirnameOfCaller() {
    // from here, it's the caller's caller
    let callerFilename = stackTrace.get()[2].getFileName();
    let callerDirname = path.dirname(callerFilename);
    return callerDirname;
}





// TODO: temp testing...
function isNpmModuleIdentifier(id: string) {
    return /^[a-z0-9-][a-z0-9_-]*$/.test(id);
}

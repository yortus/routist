import * as fs from 'fs';
import promisify from './promisify';
var origGlob = require('glob');
var origMkdirp = require('mkdirp');





// Promisify selected fs functions.
export let appendFile = <(path: string, data: any, options: any) => Promise<void>> <any> promisify(fs.appendFile);
export let close = <(fd: number) => Promise<void>> <any> promisify(fs.close);
export let exists = (path: string) => new Promise<boolean>((resolve: any) => { fs.exists(path, resolve); }); //TODO: remove fs.exists - it's deprecated...
export let existsSync = fs.existsSync;
export let open = <(path: string, flags: string, mode: string) => Promise<number>> <any> promisify(fs.open);
export let readdir = <(path: string) => Promise<string[]>> <any> promisify(fs.readdir);
export let readFile = <(path: string, encoding: string) => Promise<string>> <any> promisify(fs.readFile);
export let stat = <(path: string) => Promise<fs.Stats>> promisify(fs.stat);
export let writeFile = <(path: string, data: Buffer, encoding: string) => Promise<void>> <any> promisify(fs.writeFile);





// Promisify glob. Promisify does not work well on this one for some reason.
export function glob(pattern: string, options = {}) {
    return new Promise<string[]>((resolve: any, reject) => {
        origGlob(pattern, options, (err, matches) => err ? reject(err) : resolve(matches));
    });
}

// Synchronous glob.
export let globSync = origGlob.sync;





// Promisify mkdirp.
export var mkdirp = <(path: string) => Promise<void>> <any> promisify(origMkdirp);

import {machineIdSync} from 'node-machine-id';
import * as path from 'path';
import {format} from 'util';
import HttpOptions from './http-options';





// TODO: doc...
export default class HttpConfiguration {

    constructor(options?: HttpOptions) {
        validateOptions(options); // NB: may throw
        options = options || {};
        let session = options.session || {};

        this.secret = machineIdSync();
        this.port = options.port || 8080;
        this.sessionDir = path.resolve(process.cwd(), session.dir || 'sessions');
        this.sessionTimeout = session.timeout || 600;
    }

    secret: string;

    port: number;

    sessionDir: string;

    sessionTimeout: number;
}





// TODO: doc...
function validateOptions(options?: HttpOptions) {

    // TODO: port...
    // TODO: secret...
    // TODO: isUser, isRole, getImpliedRoles...

    // sessions.dir must be a string, or undefined
    if (options && options.session && options.session.dir) {
        let isValid = typeof options.session.dir === 'string';
        if (!isValid) {
            let fmt = `Expected an string or undefined value for options.sessions.dir, but found %j.`;
            throw new Error(format(fmt, options.session.dir));
        }
    }

    // sessions.timeout must be a positive number, or undefined
    if (options && options.session && options.session.timeout) {
        let isValid = typeof options.session.timeout === 'number';
        isValid = isValid && options.session.timeout > 0;
        if (!isValid) {
            let fmt = `Expected a positive number or undefined value for options.sessions.timeout, but found %j.`;
            throw new Error(format(fmt, options.session.timeout));
        }
    }
}

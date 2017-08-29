import {machineIdSync} from 'node-machine-id';
import * as path from 'path';
import {format} from 'util';
import {AccessControlConfiguration} from '../access-control';
import HttpOptions from './http-options';





// TODO: doc...
export default class HttpConfiguration extends AccessControlConfiguration {

    constructor(options?: HttpOptions) {
        super(options);
        options = options || {};
        validateOptions(options); // NB: may throw
        this.secret = options.secret || machineIdSync();
        this.port = options.port || 8080;
        this.sessionsDir = options.sessionsDir || path.join(process.cwd(), 'sessions');
    }

    secret: string;

    port: number;

    sessionsDir: string;
}





// TODO: doc...
function validateOptions(options: HttpOptions) {

    // TODO: port...
    // TODO: secret...
    // TODO: isUser, isRole, getImpliedRoles...

    // sessionsDir must be an absolute path, or undefined
    if (options.sessionsDir !== undefined) {
        let isValid = typeof options.sessionsDir === 'string';
        isValid = isValid && path.isAbsolute(options.sessionsDir);
        if (!isValid) {
            let fmt = `Expected an absolute path or undefined value for options.sessionsDir, but found %j.`;
            throw new Error(format(fmt, options.sessionsDir));
        }
    }
}

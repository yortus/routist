import * as path from 'path';
import {format} from 'util';
import HttpServerOptions from '../http-server-options';





export default function validateOptions(options: HttpServerOptions) {

    // TODO: port...
    // TODO: secret...

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

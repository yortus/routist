import * as path from 'path';
import {format} from 'util';
import Options from './options';





export default function validateOptions(options: Options) {

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

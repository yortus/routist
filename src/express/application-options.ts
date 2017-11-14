import * as Joi from 'joi';
import {machineIdSync} from 'node-machine-id';
import * as path from 'path';
import * as pkgDir from 'pkg-dir';
import DeepPartial from '../util/deep-partial';





export type ApplicationOptions = DeepPartial<ApplicationConfig>;
export default ApplicationOptions;





export interface ApplicationConfig {
    compressResponses: boolean;
    faviconPath: string;
    parseBody: boolean;
    sessions: {
        type: 'fs' | 'memory';
        dir: string; // NB: if not an absolute path, it is relative to CWD
        secret: string;
        ttl: number; // NB: in seconds
    };
    usingReverseProxy: boolean;
}





export function validate(options: ApplicationOptions): ApplicationConfig {
    let result = Joi.validate(options, SCHEMA);
    if (result.error) throw result.error;
    return result.value as ApplicationConfig;
}





// TODO: Schema for runtime validation...
const DEFAULT_FAVICON_PATH = path.join(pkgDir.sync(__dirname)!, 'extras/public/default-favicon.ico');
const DEFAULT_SESSIONS = { type: 'fs', dir: 'sessions', secret: machineIdSync(), ttl: 600 };
const SCHEMA = Joi.object().keys({
    compressResponses: Joi.boolean().optional().default(false),
    faviconPath: Joi.string().optional().default(DEFAULT_FAVICON_PATH),
    parseBody: Joi.boolean().optional().default(true),
    sessions: Joi.object().optional().default(DEFAULT_SESSIONS).keys({
        type: Joi.string().required().equal('fs', 'memory').default(DEFAULT_SESSIONS.type),
        dir: Joi.string().optional().default('sessions').default(DEFAULT_SESSIONS.dir),
        secret: Joi.string().optional().default(DEFAULT_SESSIONS.secret),
        ttl: Joi.number().optional().default(600).default(DEFAULT_SESSIONS.ttl),
    }),
    usingReverseProxy: Joi.boolean().optional().default(false),
});

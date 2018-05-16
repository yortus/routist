import * as Joi from 'joi';
import {machineIdSync} from 'node-machine-id';
import DeepPartial from '../../util/deep-partial';





export type ApplicationOptions = DeepPartial<ApplicationConfig>;
export default ApplicationOptions;





export interface ApplicationConfig {
    compressResponses: boolean;
    parseBody: boolean;
    sessions: {
        type: 'fs' | 'memory';
        path: string; // NB: if not an absolute path, it is relative to CWD
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
const DEFAULT_SESSIONS = { type: 'fs', path: 'sessions.json', secret: machineIdSync(), ttl: 600 };
const SCHEMA = Joi.object().keys({
    compressResponses: Joi.boolean().optional().default(false),
    parseBody: Joi.boolean().optional().default(true),
    sessions: Joi.object().optional().default(DEFAULT_SESSIONS).keys({
        type: Joi.string().optional().equal('fs', 'memory').default(DEFAULT_SESSIONS.type),
        dir: Joi.string().optional().default(DEFAULT_SESSIONS.path),
        secret: Joi.string().optional().default(DEFAULT_SESSIONS.secret),
        ttl: Joi.number().optional().default(600).default(DEFAULT_SESSIONS.ttl),
    }),
    usingReverseProxy: Joi.boolean().optional().default(false),
});
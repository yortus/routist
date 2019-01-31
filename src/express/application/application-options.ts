import * as Joi from 'joi';
import Request from '../../request';
import DeepPartial from '../../util/deep-partial';





export type ApplicationOptions = DeepPartial<ApplicationConfig>;
export default ApplicationOptions;





export interface ApplicationConfig {
    compressResponses: boolean;
    parseBody: boolean;
    getUser: (req: Request) => string | null;
    setUser: (req: Request, value: string | null) => void;

    // TODO: deprecate altogether... (move to caller's responsibility)
    sessions: {
        type: 'none' | 'memory';
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
const DEFAULT: ApplicationConfig = {
    compressResponses: false,
    parseBody: true,
    getUser: req => {
        if (!req.session) throw new Error(`request contains no session property.`);
        return req.session.user || null;
    },
    setUser: (req, value) => {
        if (!req.session) throw new Error(`request contains no session property.`);
        req.session.user = value;
    },
    sessions: {
        type: 'none',
        secret: '-',
        ttl: 0,
    },
    usingReverseProxy: false,
};
const SCHEMA = Joi.object().keys({
    compressResponses: Joi.boolean().optional().default(DEFAULT.compressResponses),
    parseBody: Joi.boolean().optional().default(DEFAULT.parseBody),
    getUser: Joi.func().arity(1).optional().default(DEFAULT.getUser),
    setUser: Joi.func().arity(2).optional().default(DEFAULT.setUser),
    sessions: Joi.object().optional().default(DEFAULT.sessions).keys({
        type: Joi.string().optional().equal('none', 'memory').default(DEFAULT.sessions.type),
        secret: Joi.string().optional().default(DEFAULT.sessions.secret),
        ttl: Joi.number().optional().default(600).default(DEFAULT.sessions.ttl),
    }),
    usingReverseProxy: Joi.boolean().optional().default(DEFAULT.usingReverseProxy),
});

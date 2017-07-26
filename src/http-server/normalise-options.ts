import {machineIdSync} from 'node-machine-id';
import * as path from 'path';
import HttpServerOptions from '../http-server-options';
import NormalOptions from './normal-options';





// TODO: doc...
export default function normaliseOptions(options: Partial<HttpServerOptions>) {
    let port = options.port || 8080;
    let secret = options.secret || machineIdSync();
    let sessionsDir = options.sessionsDir || path.join(process.cwd(), 'sessions');

    return {port, secret, sessionsDir} as NormalOptions;
}

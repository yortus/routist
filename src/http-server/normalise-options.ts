import {machineIdSync} from 'node-machine-id';
import * as path from 'path';
import NormalOptions from './normal-options';
import Options from './options';





// TODO: doc...
export default function normaliseOptions(options: Options) {
    let port = options.port || 8080;
    let secret = options.secret || machineIdSync();
    let sessionsDir = options.sessionsDir || path.join(process.cwd(), 'sessions');
    let isUser = options.isUser;
    let isRole = options.isRole;
    let getImpliedRoles = options.getImpliedRoles || (() => ([]));

    return {port, secret, sessionsDir, isUser, isRole, getImpliedRoles} as NormalOptions;
}

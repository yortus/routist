import AccessControlOptions, {isImmediateOptions} from './access-control-options';





// TODO: doc...
export default class AccessControlConfiguration {

    constructor(options?: AccessControlOptions) {
        options = options || {};
        if (isImmediateOptions(options)) {
            // TODO: validate passed-in allRoles hash? Or better to be permissive/lazy?
            const allRoles = options.allRoles;
            this.isDefinedRole = role => allRoles.hasOwnProperty(role);
            this.getImpliedRoles = role => allRoles[role];
        }
        else {
            this.isDefinedRole = options.isDefinedRole;
            this.getImpliedRoles = options.getImpliedRoles || (() => []);
        }
    }

    validateRole(role: string): void {
        if (role === '*') return; // Special case; matches all roles

        if (role.length === 0) throw new Error('An empty string is not a valid role');

        // NB: disallowed special chars: '/' (used in discriminant), '<>' (role delimiters), ' ' (conjunct role sep)
        if (!/^[a-zA-Z0-9._@-]+$/.test(role)) {
            const msg = `Role '${role}' contains invalid characters.`
                      + ` Valid characters are alphanumerics plus '_', '-', '.' and '@'.`;
            throw new Error(msg);
        }

        if (this.isDefinedRole && !this.isDefinedRole(role)) {
            throw new Error(`Unrecognised role '${role}'`);
        }
    }

    getAllImpliedRoles(roles: string[]): string[] {
        if (roles.length === 1 && roles[0] === '*') return roles; // TODO: special case - '*' doesn't expand
        let result = getAllImpliedRoles(roles, this.getImpliedRoles);

        // TODO: sanity checks... may throw.
        result.forEach(role => this.validateRole(role));
        if (result.some(role => role === '*')) throw new Error(`'*' cannot be an implied role`);

        return result;
    }

    private isDefinedRole?: (role: string) => boolean;

    private getImpliedRoles: (role: string) => string[];
}





// TODO: doc... calcs transitive closure; also dedupes and sorts the roles
function getAllImpliedRoles(initialRoles: string[], impliedRoles: (role: string) => string[]) {
    let roles = [] as string[];
    let moreRoles = initialRoles.slice();
    while (moreRoles.length > 0) {
        let role = moreRoles.shift()!;
        if (!roles.includes(role)) roles.push(role);
        moreRoles = moreRoles.concat(impliedRoles(role));
    }
    roles.sort();
    return roles;
}

// import * as JsonRefs from 'json-refs';
import * as multimethods from 'multimethods';
import {Authoriser, Message, User} from '../../core';
import RoleAuthoriserOptions from './role-authoriser-options';





export default function makeRoleAuthoriser(options: RoleAuthoriserOptions): Authoriser {
    interface SubRoles { [roleName: string]: SubRoles; }

    // TODO: resolve $refs first... using npm lib, oder...? disable $refs for now?

    // TODO: build data structures... nodes in topologically sorted order...
    let nodes = [] as string[];
    let edges = [] as Array<[string, string]>;
    accumulateNodesAndEdges(null, options.roles);

    // Reverse the nodes so that more specific roles always come before their more general roles.
    // Also reverse the edges accordingly.
    nodes.reverse();
    edges.forEach(edge => edge.reverse());

    // TODO: compute transitive closure of implied roles...
    let allRoles = new Map<string, string[]>();
    nodes.forEach(role => allRoles.set(role, [role]));
    for (let i = nodes.length - 1; i >= 0; --i) {
        let node = nodes[i];
        let nodeRoles = allRoles.get(node)!;

        // For each edge from SUP to SUB, add ...?
        for (let [sup, sub] of edges) {
            if (sub === node) {
                allRoles.get(sup)!.push(...nodeRoles);
            }
        }
    }

    // TODO: deduplicate and sort roles... could probably wait 'til later, at least for sorting...
    allRoles.forEach((val, key) => allRoles.set(key, dedupe(val).sort()));

    // 1. all roles associated with each user...
    let rolesPerUser = new Map<string, string[]>();
    Object.keys(options.users).forEach(user => {
        let userRoles = options.users[user];
        if (!Array.isArray(userRoles)) userRoles = [userRoles];
        let allUserRoles = ([] as string[]).concat(...userRoles.map(role => allRoles.get(role)!));
        rolesPerUser.set(user, dedupe(allUserRoles).sort());
    });

    // 2. role discriminant associated with each user...
    let roleDiscriminantPerUser = new Map<string, string>();
    rolesPerUser.forEach((roles, user) => {
        let disc = roles.length === 0 ? '' : `<${roles.join('><')}>`;
        roleDiscriminantPerUser.set(user, disc);
    });

    // 3. predicate associated with each policy...
    let policyPredicates = options.policies.map(([role, headlinePred, _]) => {
        let roles = allRoles.get(role)! || [];
        let rolePred = roles.length === 0 ? '*' : `*<${roles.join('>*<')}>*`;
        return `${rolePred}/${headlinePred}`;
    });

    // 4. handler associated with each policy...
    let policyHandlers = options.policies.map(([_, __, policyName]) => {
        switch (policyName) {
            case 'allow':   return () => true;
            case 'deny':    return () => false;
            default:        throw new Error(`Unknown policy '${policyName}'`); // TODO: improve error handling...
        }
    });

    let mm = multimethods.create<Message, User, boolean>({
        name: `isAuthorised`,
        arity: 2,
        async: false,
        methods: policyPredicates.reduce(
            (meths, pred, i) => (meths[pred] = policyHandlers[i], meths),
            {} as {[pred: string]: any}
        ),
        toDiscriminant: (msg, user) => {
            return `${roleDiscriminantPerUser.get(user) || roleDiscriminantPerUser.get('*') || ''}/${msg.headline}`;
        },
        unreachable: isUnreachable,
        /* strict */
    });

    return mm;





    // TODO: helper I...
    // NB: since we go top-down depth-first through the DAG, nodes are topologically sorted with subroles last
    // NB: roleName === null for top-level subroles
    function accumulateNodesAndEdges(roleName: string|null, subroles: SubRoles) {
        if (roleName !== null && nodes.indexOf(roleName) === -1) nodes.push(roleName);
        for (let subRoleName in subroles) {
            if (!subroles.hasOwnProperty(subRoleName)) continue;
            if (roleName !== null) edges.push([roleName, subRoleName]);
            accumulateNodesAndEdges(subRoleName, subroles[subRoleName]); // NB: recursive
        }
    }

    function dedupe<T>(array: T[]) {
        return array.filter((el, i) => array.indexOf(el) === i);
    }
}





// TODO: temp testing...
function isUnreachable(p: string) {

    // Only consider the form `*A*B*C*...*/...`
    p = p.split('/')[0];
    if (p.length < 3) return;
    if (p.charAt(0) !== '*' || p.charAt(p.length - 1) !== '*') return;
    if (p.indexOf('**') !== -1) return;

    // If the parts aren't strictly ordered, it's unreachable
    let parts = p.slice(1, -1).split('*');
    for (let i = 0, j = 1; j < parts.length; ++i, ++j) {
        if (parts[i] >= parts[j]) return true;
    }
    return;
}

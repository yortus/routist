




// TODO: was: { initial: Array<...>, changes: EventEmitter }
export default interface RoleAuthoriserOptions {

    // Map users to their role or roles
    users: {[user: string]: string|string[]; };

    // Nested object representing top-down role hierarchy DAG
    // TODO: doc... may be a DAG using JSON refs + pointers...
    // TODO: impl JSON refs+pointers, ensure no cycles and that top-level roles have no incoming edges
    roles: {[role: string]: RoleAuthoriserOptions['roles']};

    // Triples of [role predicate, headline predicate, policy name]
    policies: Array<[string, string, string]>;
}

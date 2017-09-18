export {default as makeRoleAuthoriser} from './make-role-authoriser';
export {default as RoleAuthoriserOptions} from './role-authoriser-options';





// TODO: was... needed?
// - is a string
// - starts with '$' (so is differentiable from users at runtime)
// - is case-sensitive (recommend using only lower case)
// - consists of chars [A-Za-z0-9@._-] after the initial '$' (NB: no spaces)
// export type Role = string & { __roleBrand: any; };






// TODO: doc... supplied by client code
type AccessControlOptions = OnDemandOptions | ImmediateOptions;
export default AccessControlOptions;





// TODO: doc...
export interface OnDemandOptions {
    isDefinedRole?(role: string): boolean;
    getImpliedRoles?(role: string): string[];
}





// TODO: doc...
export interface ImmediateOptions {
    allRoles: {[role: string]: string[]};
}





// TODO: doc...
export function isOnDemandOptions(options: AccessControlOptions): options is OnDemandOptions {
    const allRolesPropKey: keyof ImmediateOptions = 'allRoles';
    return !options.hasOwnProperty(allRolesPropKey);
}





// TODO: doc...
export function isImmediateOptions(options: AccessControlOptions): options is ImmediateOptions {
    const allRolesPropKey: keyof ImmediateOptions = 'allRoles';
    return options.hasOwnProperty(allRolesPropKey);
}

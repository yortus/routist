import {RoleTag, UserTag} from '../access-control';





// TODO: doc...
export default interface NormalOptions {
    secret: string;
    port: number;
    sessionsDir: string;
    isUser?(user: string): boolean;
    isRole?(role: string): boolean;
    getImpliedRoles(userOrRole: UserTag|RoleTag): RoleTag[];
}

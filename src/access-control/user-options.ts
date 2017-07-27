import RoleTag from './role-tag';
import UserTag from './user-tag';





// TODO: doc... supplied by client code
export default interface UserOptions {
    isUser?(user: string): boolean;
    isRole?(role: string): boolean;
    getImpliedRoles?(userOrRole: UserTag|RoleTag): RoleTag[];
}

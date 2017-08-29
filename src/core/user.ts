import Role from './role';





// TODO: doc... user is-a role
type User = Role & { __userBrand: any; };
export default User;

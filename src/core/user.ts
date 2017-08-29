import Role from './role';





// TODO: doc... user is-a role
export default interface User extends Role {
    __userBrand: any;
}






// TODO: doc... restrictions on chars: only lowercase alphanum + hyphen (or underscore?)
type RoleTag = string & { __roleTagBrand: any };
export default RoleTag;

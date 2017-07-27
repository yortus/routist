




// TODO: doc... restrictions on chars: only lowercase alphanum + hyphen (or underscore?)
type UserTag = string & {__userTagBrand: any};
export default UserTag;

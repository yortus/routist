




// TODO: doc...
// - is a string
// - valid chars: [A-Za-z0-9@._-]
// - no spaces
// - no '$' (so is differentiable from roles at runtime)
type User = string & { __userBrand: any; };
export default User;

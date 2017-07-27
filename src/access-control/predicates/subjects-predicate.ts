




// TODO: doc: special format...
//       - e.g. `bob:*<it>*<manager>*`
//       - user tag followed by 0:M role tags
//       - ':' separator between user tag and role tags
//       - role tags enclosed in '<>' delimiters
//       - role tags separated and enclosed by '*' wildcard chars
//       - role tags arranged in alphabetical order (ascii)
//       - NO '/' and NO globstars ('**')!
type SubjectsPredicate = string & { __subjectsPredicateBrand: any };
export default SubjectsPredicate;

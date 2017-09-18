// declare module 'json-refs' {

//     export interface ResolvedRefsResults {
//         refs: {[pointer: string]: ResolvedRefDetails};
//         resolved: object;
//     }

//     export interface ResolvedRefDetails {
//         circular: boolean;
//         missing: boolean;
//         value: any;
//     }

//     export interface UnresolvedRefDetails {
//         def: object;
//         error?: string;
//         uri: string;
//         uriDetails: object;
//         type: 'invalid'|'local'|'relative'|'remote';
//         warning?: string;
//     }

//     export function findRefs(obj: object, options?: {}): {[pointer: string]: UnresolvedRefDetails};

//     export function resolveRefs(obj: object, options?: {}): Promise<ResolvedRefsResults>;
// }

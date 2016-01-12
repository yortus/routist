// 
// 'use strict';
// import * as assert from 'assert';
// import {default as RoutePattern, RoutePatternRelation as Relation} from './route-pattern';
// 
// 
// 
// 
// 
// type Item = RoutePattern;
// 
// 
// 
// 
// 
// export default class RouteFamily {
// 
// 
//     constructor(item: Item) {
//         this.item = item;
//         this.children = [];
//     }
// 
// 
//     item: Item;
// 
// 
//     children: RouteFamily[];
// 
// 
//     /** Inserts the given pattern into the appropriate position in this family. */
//     insert(item: Item) {
//         addRouteToFamily(item, this);
//     }
//     
// 
//     /** Depicts the route family as a multi-line list of pattern strings, with children indented from their parent. */
//     toString(): string {
//         var result = `${this.item.canonical} (${1})`; // TODO: restore count
//         result += this.children.map(child => '\n' + child.toString().split('\n').map(line => '  ' + line).join('\n')).join('');
//         return result;
//     }
// }
// 
// 
// 
// 
// 
// function addRouteToFamily(item: Item, family: RouteFamily) {
// 
//     // Compare the new pattern to the pattern of each of the family's existing children.
//     let relations = family.children.map(child => item.compare(child.item));
//     let equivalent = family.children.filter((_, i) => relations[i] === Relation.Equal);
//     let moreGeneral = family.children.filter((_, i) => relations[i] === Relation.Subset);
//     let moreSpecial = family.children.filter((_, i) => relations[i] === Relation.Superset);
//     let overlapping = family.children.filter((_, i) => relations[i] === Relation.Overlapping);
//     let unrelated = family.children.filter((_, i) => relations[i] === Relation.Disjoint);
// 
//     // Sanity check. Should be unnecessary due to invariants.
//     assert(equivalent.length <= 1);
//     assert(equivalent.length === 0 || moreGeneral.length === 0);
//     assert(equivalent.length === 0 || moreSpecial.length === 0);
//     assert(equivalent.length === 0 || overlapping.length === 0);
//     assert(moreGeneral.length === 0 || moreSpecial.length === 0);
// 
//     if (equivalent.length === 1) {
//         // TODO: bundles etc - just error for now
//         //throw new Error(`equivalent: not implemented`);
// 
//         // TODO: temp testing... Just incr existing and return (no other work due to invariants)        
//         // TODO: was... restore count... equivalent[0].count += 1;
//         return;
//     }
//     if (overlapping.length > 0) {
//         // TODO: THE BIG CAHUNA - just error for now. But full treatment should be as follows:
//         // - compute intersection of newPattern and child.pattern (FOR EACH ONE)
//         // - addRouteToFamily(intersection, newFamily)
//         // - addRouteToFamily(intersection, child)
//         // - add newFamily to family
//         //throw new Error(`overlapping: not implemented`);
// 
//         // TODO: temp testing...
//         overlapping.forEach(overlap => {
//             let common = item.intersect(overlap.item);
//             let newFamily = new RouteFamily(item);
//             addRouteToFamily(common, overlap);
//             addRouteToFamily(common, newFamily);
//             family.children.push(newFamily);
//         });
//         return;
//     }
//     if (moreGeneral.length > 1) {
//         // TODO: can happen if existing children overlap and new one is in their intersection - just error for now
//         throw new Error(`moreGeneral.length > 1: not implemented`);
//     }
// 
// 
//     if (moreGeneral.length === 1) {
// 
//         // TODO: recursively addRouteToFamily to every such child. Assume 0..1 such children for now...
//         addRouteToFamily(item, moreGeneral[0]);
//     }
//     else if (moreSpecial.length > 0) {
// 
//         // Make a new RouteFamily instance for the new pattern.
//         let newFamily = new RouteFamily(item);
// 
//         // TODO: transfer all such children to become children of newFamily, then add newFamily as child of family
//         newFamily.children = moreSpecial;
//         family.children = family.children.filter(child => moreSpecial.indexOf(child) === -1);
//         family.children.push(newFamily);
//     }
//     else {
//         // TODO: temp testing...
//         family.children.push(new RouteFamily(item));
//     }
// 
//     // TODO: nothing to do for these...
//     unrelated;
// }
//# sourceMappingURL=route-family.js.map
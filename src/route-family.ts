
'use strict';
import * as assert from 'assert';
import {default as RoutePattern, RoutePatternRelation as Relation} from './route-pattern';





export default class RouteFamily {


    constructor(pattern: RoutePattern) {
        this.pattern = pattern;
        this.count = 1;
        this.children = [];
    }


    pattern: RoutePattern;


    count: number;


    children: RouteFamily[];


    /** Inserts the given pattern into the appropriate position in this family. */
    add(pattern: RoutePattern) {
        addRouteToFamily(pattern, this);
    }
    

    /** Depicts the route family as a multi-line list of pattern strings, with children indented from their parent. */
    toString(): string {
        var result = `${this.pattern ? this.pattern.canonical : '<top>'} (${this.count})`;
        result += this.children.map(child => '\n' + child.toString().split('\n').map(line => '  ' + line).join('\n')).join('');
        return result;
    }
}





function addRouteToFamily(newPattern: RoutePattern, family: RouteFamily) {

    // Compare the new pattern to the pattern of each of the family's existing children.
    let relations = family.children.map(child => newPattern.compare(child.pattern));
    let equivalent = family.children.filter((_, i) => relations[i] === Relation.Equal);
    let moreGeneral = family.children.filter((_, i) => relations[i] === Relation.Subset);
    let moreSpecial = family.children.filter((_, i) => relations[i] === Relation.Superset);
    let overlapping = family.children.filter((_, i) => relations[i] === Relation.Overlapping);
    let unrelated = family.children.filter((_, i) => relations[i] === Relation.Disjoint);

    // Sanity check. Should be unnecessary due to invariants.
    assert(moreGeneral.length === 0 || moreSpecial.length === 0);

    if (equivalent.length > 0) {
        // TODO: bundles etc - just error for now
        throw new Error(`equivalent: not implemented`);
    }
    if (overlapping.length > 0) {
        // TODO: THE BIG CAHUNA - just error for now. But full treatment should be as follows:
        // - compute intersection of newPattern and child.pattern (FOR EACH ONE)
        // - addRouteToFamily(intersection, newFamily)
        // - addRouteToFamily(intersection, child)
        // - add newFamily to family
        throw new Error(`overlapping: not implemented`);
    }
    if (moreGeneral.length > 1) {
        // TODO: can happen if existing children overlap and new one is in their intersection - just error for now
        throw new Error(`moreGeneral.length > 1: not implemented`);
    }


    if (moreGeneral.length === 1) {

        // TODO: recursively addRouteToFamily to every such child. Assume 0..1 such children for now...
        addRouteToFamily(newPattern, moreGeneral[0]);
    }
    else if (moreSpecial.length > 0) {

        // Make a new RouteFamily instance for the new pattern.
        let newFamily = new RouteFamily(newPattern);

        // TODO: transfer all such children to become children of newFamily, then add newFamily as child of family
        newFamily.children = moreSpecial;
        family.children = family.children.filter(child => moreSpecial.indexOf(child) === -1);
        family.children.push(newFamily);
    }
    else {
        // TODO: temp testing...
        family.children.push(new RouteFamily(newPattern));
    }

    // TODO: nothing to do for these...
    unrelated;
}

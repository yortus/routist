'use strict';
import Pattern from '../pattern';
import Rule from './rule';
// TODO: move these into other foles as follows, and delete this file:
//       - RuleSet --> compile-rule-set.ts
//       - Handler --> ???
//       - Route --> make-route-handler.ts





// TODO: doc...
export type RuleSet = { [pattern: string]: Function };
// TODO: pass address to downstream via closure created for every request
//       - it's only ~20% slower than explicit addr passing, and at least as fast as caching by addr
//       - see: http://jsperf.com/54327545112451459541954/2





// TODO: doc...
// TODO: temp change sig to find site needing attention...
export type Handler = (address: string, request: Request) => Response;
export interface Request {}
export interface Response {}




// TODO: doc...
// TODO: a list of rules ordered from most general to most specific, where for all N rule N is a superset of rule N+1
export interface Route extends Array<Rule> { }

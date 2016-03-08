'use strict';
import Pattern from '../pattern';
import Rule from './rule';
// TODO: move these into other foles as follows, and delete this file:
//       - RuleSet --> compile-rule-set.ts
//       - Handler --> ???





// TODO: remove this unnecessary type...
export type RuleSet = { [pattern: string]: Function };





// TODO: doc...
// TODO: temp change sig to find site needing attention...
export type Handler = (address: string, request: Request) => Response;
export interface Request {}
export interface Response {}

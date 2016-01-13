'use strict';
import Request from './request';
import Response from './response';


export default function makeRouteFinder(routes: Route[]) {
    // TODO: ...
    throw new Error('Not implemented');
}


interface Route {
    pattern: string;
    handler: (...args) => Response;
}


interface Node {
    pattern: string;
    handlers: any[];
    specializations: Node[];
    generalizations: Node[];
}

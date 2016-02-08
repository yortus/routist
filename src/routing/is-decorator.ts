'use strict';
import Handler from './handler';
import Request from '../request';
import Response from '../response';





// TODO: revise doc...
/**
 * Indicates whether or not `handler` is a decorator. A handler is a decorator
 * if its action function includes the name '$next' as a formal parameter. See
 * Handler#execute for more information execution differences between decorators
 * and non-decorators.
 */
export default function isDecorator(handler: Handler): handler is Decorator {
    return handler.length === 2;
}





// TODO: doc...
type Decorator = (request: Request, downstream: (request: Request) => Response) => Response;

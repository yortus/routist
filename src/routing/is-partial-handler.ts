'use strict';
import {GeneralHandler, PartialHandler} from './types';
// TODO: revise docs below...





/**
 * Indicates whether or not `handler` is a decorator. A handler is a decorator
 * if its action function includes the name '$next' as a formal parameter. See
 * Handler#execute for more information on execution differences between decorators
 * and non-decorators.
 */
export default function isPartialHandler(handler: PartialHandler | GeneralHandler): handler is PartialHandler {
    return handler.length === 1;
}

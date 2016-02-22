'use strict';
import {GeneralHandler, PartialHandler} from './types';
import {getFunctionParameterNames} from '../util';
// TODO: revise docs below...





/**
 * Indicates whether or not `handler` is a decorator. A handler is a decorator
 * if its action function includes the name '$next' as a formal parameter. See
 * Handler#execute for more information on execution differences between decorators
 * and non-decorators.
 */
export default function isPartialHandler(handler: PartialHandler | GeneralHandler): handler is PartialHandler {

    // TODO: super inefficient!!! Review this...    
    return getFunctionParameterNames(handler).indexOf('$next') === -1;
    // TODO: was... return handler.length === 2;
}

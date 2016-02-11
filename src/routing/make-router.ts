'use strict';
import Handler from './handler';
import isDecorator from './is-decorator';
import makePatternIdentifier from './make-pattern-identifier';
import Request from '../request';
import Response from '../response';
import Rule from './rule';




// TODO: ...
export default function makeRouter(ruleWalk: Rule[]) {

    let reverseRuleWalk = ruleWalk.slice().reverse();


    let name = '__' + makePatternIdentifier(reverseRuleWalk[0].pattern) + '__';


    // TODO: ...
    let execute = reverseRuleWalk.reduce<(rq: Request) => Response>((downstream, rule) => { // TODO: fix cast!
        let result: (request: Request) => Response;
        let handler = <(request: Request, downstream?: Function) => Response>  rule.handler; // TODO: fix cast
        if (isDecorator(rule.handler)) {
            result = request => handler(request, downstream);
        }
        else {
            result = request => {
                let response = downstream(request);
                if (response !== null) return response;
                return handler(request);
            };
        }
        return result;
    }, noMore);

    let source = `function ${name}(request) { return execute(request); }`;
    let result: (request: Request) => Response;
    result = eval(`(${source})`);
    return result;
}





// TODO: ...
const noMore = (rq: Request) => <Response> null;

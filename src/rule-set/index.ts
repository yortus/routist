export {default} from './rule-set';





declare var handle_apiﾉfoᕽo;
declare var handle_apiﾉfoᕽ;
declare var handle_apiﾉfoᕽ_1;
declare var handle_apiﾉ﹍;
declare var handle_apiﾉ﹍_1;
declare var handle_﹍;
declare var isPromise;





// TODO: temp testing... remove all this...
function route_apiﾉfoᕽo____(address, request) {
    var req = request, res, captures;
    
    function downstream_of_apiﾉfoᕽ(req) {
        // stays unchanged - pass on the promise returned below...
        return handle_apiﾉfoᕽo();
    }
    
    function downstream_of_apiﾉfoᕽ_1(req) {
        // stays unchanged - pass on the promise returned below...
        return handle_apiﾉfoᕽ(req === void 0 ? request : req, downstream_of_apiﾉfoᕽ);
    }

    function main(res, state: number) { // TODO: only needed if >1 states
        switch (state) { // TODO: only needed if >1 states
            case 1:
                if (res !== null) return res; // TODO: can omit for state==1
                res = handle_apiﾉfoᕽ_1(req === void 0 ? request : req, downstream_of_apiﾉfoᕽ_1);
                if (isPromise(res)) return res.then(res => main(res, 2));
                /* fall-through */

            case 2:
                if (res !== null) return res;
                res = handle_apiﾉ﹍_1();
                if (isPromise(res)) return res.then(res => main(res, 3));
                /* fall-through */

            case 3:
                if (res !== null) return res;
                res = handle_﹍();
                return res; // TODO: only last case - return whether promise, null, or otherwise...
        }
    }
    main(res, 1);
}

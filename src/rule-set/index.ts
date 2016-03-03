export {default} from './rule-set';





declare var handle_apiﾉfoᕽo;
declare var handle_apiﾉfoᕽ;
declare var handle_apiﾉfoᕽ_1;
declare var handle_apiﾉ﹍;
declare var handle_apiﾉ﹍_1;
declare var handle_﹍;
declare var isPromise;
declare var handle_apiﾉfoo;
declare var handle_apiﾉfoo_1;





// TODO: temp testing... remove all this...
function route_apiﾉfoᕽo____(address, request) {
    var req = request, res, captures;
    
    function downstream_of_apiﾉfoᕽ(req?) {
        // stays unchanged - pass on the promise returned below...
        return handle_apiﾉfoᕽo();
    }
    
    function downstream_of_apiﾉfoᕽ_1(req?) {
        // stays unchanged - pass on the promise returned below...
        return handle_apiﾉfoᕽ(req === void 0 ? request : req, downstream_of_apiﾉfoᕽ);
    }

    function main(req?, state?) { // TODO: only needed if >1 states
        switch (state || 1) { // TODO: only needed if >1 states
            case 1:
                if (res !== null) return res; // TODO: can omit for state==1
                res = handle_apiﾉfoᕽ_1(req === void 0 ? request : req, downstream_of_apiﾉfoᕽ_1);
                if (isPromise(res)) return res.then(val => (res = val, main(req, 2)));
                /* fall-through */

            case 2:
                if (res !== null) return res;
                res = handle_apiﾉ﹍_1();
                if (isPromise(res)) return res.then(val => (res = val, main(req, 3)));
                /* fall-through */

            case 3:
                if (res !== null) return res;
                res = handle_﹍();
                return res; // TODO: only last case - return whether promise, null, or otherwise...
        }
    }
    main();
}





function route_apiﾉfoo(address, request) {
    var res = null;
    function self(req) {
        if (req === void 0) res = request;
        switch (state) {

            case 1:
                res = handle_apiﾉfoo();
                return res;

            case 2:
                res = handle_apiﾉfoo_1(req, (state = 1, self));
                if (isPromise(res)) return res.then(val => { res = val; state = 3; self(req); });
                /* else fall through */

            case 3:
                if (res !== null) return res;
                res = handle_apiﾉfoᕽo();
                return res;

            case 4:
                res = handle_apiﾉfoᕽ(req, (state = 2, self));
                return res;

            case 5:
                res = handle_apiﾉfoᕽ_1(req, (state = 4, self));
                if (isPromise(res)) return res.then(val => { res = val; state = 6; self(req); });
                /* else fall through */

            case 6:
                if (res !== null) return res;
                res = handle_apiﾉ﹍();
                if (isPromise(res)) return res.then(val => { res = val; state = 7; self(req); });
                /* else fall through */

            case 7:
                if (res !== null) return res;
                res = handle_apiﾉ﹍_1();
                if (isPromise(res)) return res.then(val => { res = val; state = 8; self(req); });
                /* else fall through */

            case 8:
                if (res !== null) return res;
                res = handle_﹍();
                return res;
        }
    }

    var state = 5;
    return self(request);
}
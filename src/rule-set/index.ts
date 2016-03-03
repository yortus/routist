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
    var req = request, res, captures, state = 1;/***/

    function downstream_of_apiﾉfoo_1(req) {
        res = handle_apiﾉfoo();
        return res;
    }

    function downstream_of_apiﾉfoᕽ(req) {
        function _apiﾉfoo_1(req?) {
            switch (state/***/) {
                case 1:
                    res = handle_apiﾉfoo_1(req === void 0 ? request : req, /***/(state = 1, downstream_of_apiﾉfoo_1));
                    if (isPromise(res)) return res.then(val => (res = val, /***/state = 2, _apiﾉfoo_1(req)));
                    /* fall-through */

                case 2:
                    if (res !== null) return res;
                    res = handle_apiﾉfoᕽo();
                    return res;
            }
        }
        return _apiﾉfoo_1();
    }

    function downstream_of_apiﾉfoᕽ_1(req) {
        res = handle_apiﾉfoᕽ(req === void 0 ? request : req, /***/(state = 1, downstream_of_apiﾉfoᕽ));
        return res;
    }

    function _apiﾉfoᕽ_1(req?/***/) {
        switch (state/***/) {
            case 1:
                res = handle_apiﾉfoᕽ_1(req === void 0 ? request : req, /***/(state = 1, downstream_of_apiﾉfoᕽ_1));
                if (isPromise(res)) return res.then(val => (res = val, /***/state = 2, _apiﾉfoᕽ_1(req)));
                /* fall-through */

            case 2:
                if (res !== null) return res;
                res = handle_apiﾉ﹍();
                if (isPromise(res)) return res.then(val => (res = val, /***/state = 3, _apiﾉfoᕽ_1(req)));
                /* fall-through */

            case 3:
                if (res !== null) return res;
                res = handle_apiﾉ﹍_1();
                if (isPromise(res)) return res.then(val => (res = val, /***/state = 4, _apiﾉfoᕽ_1(req)));
                /* fall-through */

            case 4:
                if (res !== null) return res;
                res = handle_﹍();
                return res;
        }
    }
    return _apiﾉfoᕽ_1();
}

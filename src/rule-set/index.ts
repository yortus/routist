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





function route_apiﾉfoo(address, request) {
    function self(req, res, state) {
        switch (state) {

            case 1:
                return handle_apiﾉfoo();

            case 2:
                res = handle_apiﾉfoo_1(req, req => self(req === void 0 ? request : req, null, 1));
                if (isPromise(res)) return res.then(res => self(req, res, 3));
                /* else fall through */

            case 3:
                if (res !== null) return res;
                return handle_apiﾉfoᕽo();

            case 4:
                return handle_apiﾉfoᕽ(req, req => self(req === void 0 ? request : req, null, 2));

            case 5:
                res = handle_apiﾉfoᕽ_1(req, req => self(req === void 0 ? request : req, null, 4));
                if (isPromise(res)) return res.then(res => self(req, res, 6));
                /* else fall through */

            case 6:
                if (res !== null) return res;
                res = handle_apiﾉ﹍();
                if (isPromise(res)) return res.then(res => self(req, res, 7));
                /* else fall through */

            case 7:
                if (res !== null) return res;
                res = handle_apiﾉ﹍_1();
                if (isPromise(res)) return res.then(res => self(req, res, 8));
                /* else fall through */

            case 8:
                if (res !== null) return res;
                return handle_﹍();
        }
    }

    return self(request, null, 5);
}

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

    function self1(req) {
        if (req === void 0) req = request;
        return handle_apiﾉfoo();
    }

    function self2(req) {
        if (req === void 0) req = request;
        var res = handle_apiﾉfoo_1(req, self1);
        if (isPromise(res)) return res.then(res => self3(req, res));
        return self3(req, res);
    }

    function self3(req, res) {
        if (res !== null) return res;
        return handle_apiﾉfoᕽo();
    }

    function self4(req) {
        if (req === void 0) req = request;
        return handle_apiﾉfoᕽ(req, self2);
    }

    function self5(req) {
        if (req === void 0) req = request;
        var res = handle_apiﾉfoᕽ_1(req, self4);
        if (isPromise(res)) return res.then(res => self6(req, res));
        return self6(req, res);
    }

    function self6(req, res) {
        if (res !== null) return res;
        var res = handle_apiﾉ﹍();
        if (isPromise(res)) return res.then(res => self7(req, res));
        return self7(req, res);
    }

    function self7(req, res) {
        if (res !== null) return res;
        var res = handle_apiﾉ﹍_1();
        if (isPromise(res)) return res.then(res => self8(req, res));
        return self8(req, res);
    }

    function self8(req, res) {
        if (res !== null) return res;
        return handle_﹍();
    }

    return self5(request);
}

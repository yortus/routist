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
declare var handle_zzzﾉˌﾉᕽ
declare var handle_zzzﾉ﹍
declare var match_zzzﾉ﹍





function route_apiﾉfoo(address, request) {

    function self1(req) {
        return handle_apiﾉfoo();
    }

    function self2(req) {
        var res = handle_apiﾉfoo_1(req, self1);
        if (isPromise(res)) return res.then(res => self3(req, res));
        return self3(req, res);
    }

    function self3(req, res) {
        if (res !== null) return res;
        return handle_apiﾉfoᕽo();
    }

    function self4(req) {
        return handle_apiﾉfoᕽ(req, self2);
    }

    function self5(req) {
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










function route_zzzﾉˌﾉᕽ(address, request) {

    function self1(req) {
        return handle_zzzﾉˌﾉᕽ();
    }

    function self2(req) {
        var captures_zzzﾉ﹍ = match_zzzﾉ﹍(address);
        var res = handle_zzzﾉ﹍(self1, captures_zzzﾉ﹍.rest);
        if (isPromise(res)) return res.then(res => self3(req, res));
        return self3(req, res);
    }

    function self3(req, res) {
        if (res !== null) return res;
        return handle_﹍();
    }

    return self2(request);
}

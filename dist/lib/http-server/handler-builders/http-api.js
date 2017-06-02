var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const url = require("url");
function httpApi(Ctor) {
    return (req, res, captures) => __awaiter(this, void 0, void 0, function* () {
        if (!req.session)
            throw new Error(`rpc internal error: no session!`); // TODO: revise error handling
        let api = new Ctor(req.session, captures);
        if (!api || typeof api !== 'object')
            throw new Error(`rpc: invalid API object`); // TODO: revise error handling
        let pathname = '/' + url.parse(req.url).pathname;
        let funcName = pathname.substr(pathname.lastIndexOf('/') + 1);
        let func = api[funcName];
        if (typeof func !== 'function')
            throw new Error(`rpc: invalid API has no function '${funcName}'`); // TODO: revise error handling
        let args = req.body;
        let result = yield func.apply(api, args); // NB: handles both sync and async functions
        res.send(result);
        return;
    });
}
exports.default = httpApi;
//# sourceMappingURL=http-api.js.map
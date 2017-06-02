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
const serveStatic = require("serve-static");
// TODO: doc...
function staticFiles(root) {
    let serveStaticOptions = { index: [] }; // NB: Disable having `dirname` resolve to `dirname/index.html`
    let serveStaticHandler = promisifyExpressHandler(serveStatic(root, serveStaticOptions));
    return (req, res, captures) => __awaiter(this, void 0, void 0, function* () {
        if (typeof captures.path !== 'string')
            throw new Error(`static file route expects {...path} capture variable`);
        let oldUrl = req.url;
        let { protocol, auth, host, search, hash } = url.parse(oldUrl);
        let pathname = captures.path;
        req.url = url.format({ protocol, auth, host, pathname, search, hash });
        let handled = yield serveStaticHandler(req, res, {});
        req.url = oldUrl;
        return handled;
    });
}
exports.default = staticFiles;
// TODO: helpers... this is a general thing that might be useful elsewhere too...
function promisifyExpressHandler(expressHandler) {
    return (req, res) => {
        return new Promise((resolve, reject) => {
            // TODO: ...
            let interceptNext = (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(false); // UNHANDLED
                }
            };
            // Listen for response events and resolve/reject acordingly.
            // NB: This relies on Promise behaviour that subsequent calls to resolve/reject are ignored.
            res.once('finish', () => {
                resolve(undefined); // HANDLED
            });
            res.once('close', () => {
                resolve(undefined); // HANDLED
            });
            res.once('error', err => {
                interceptNext(new Error(`event: "error" with ${err}`));
            });
            // Call the original handler
            expressHandler(req, res, interceptNext);
        });
    };
}
//# sourceMappingURL=static-files.js.map
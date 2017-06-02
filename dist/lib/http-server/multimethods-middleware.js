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
const multimethods_1 = require("multimethods");
const permissions_tag_1 = require("./permissions-tag");
// TODO: use better UNHANDLED sentinel? Currently it's `false`.
class MultimethodsMiddleware {
    constructor() {
        let expressHandler = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                let result = yield instance.mm(req, res);
                if (result === false) {
                    next(); // UNHANDLED
                }
            }
            catch (err) {
                next(err);
            }
        });
        let instance = expressHandler;
        instance.add = MultimethodsMiddleware.prototype.add;
        instance.allRoutes = {};
        instance.add({});
        return instance;
    }
    add(newRoutes) {
        // Ensure no clashing keys.
        Object.keys(newRoutes).forEach(key => {
            if (this.allRoutes.hasOwnProperty(key)) {
                throw new Error(`Duplicate route pattern '${key}'`);
            }
        });
        // TODO: temp testing...
        let permissions = newRoutes[permissions_tag_1.default];
        if (permissions !== undefined) {
            console.log('========== PERMISSIONS ==========');
            console.log(permissions);
        }
        // Merge new routes into `allRoutes`.
        // TODO: take permissions into account... how to merge them?
        this.allRoutes = Object.assign(this.allRoutes, newRoutes);
        // Update the multimethod.
        this.mm = new multimethods_1.BinaryMultimethod({
            rules: this.allRoutes,
            timing: 'mixed',
            toDiscriminant: (req) => `${req.method} ${url.parse(req.url).pathname || ''}`,
            unhandled: false
        });
    }
}
exports.default = MultimethodsMiddleware;
//# sourceMappingURL=multimethods-middleware.js.map
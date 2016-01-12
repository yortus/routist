'use strict';
var normalize_handler_1 = require('../src/normalize-handler');
describe('normalizeHandler', () => {
    it('works', () => {
        let h2 = normalize_handler_1.default('/foo/{...path}/{name}.{ext}', (function (path, name, req, ext) {
            return null;
        }));
        let a = h2({ pathname: '/foo/bar/baz.html' });
    });
});
//# sourceMappingURL=normalize-handler.js.map
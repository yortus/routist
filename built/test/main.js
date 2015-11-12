var routist = require('..'); // TODO: use public API... But need to copy index.d.ts to /built to do that
describe('it', function () {
    it('works', function (done) {
        routist.main().then(function (result) {
            console.log(result);
            done();
        });
    });
});
//# sourceMappingURL=main.js.map
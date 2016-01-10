function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
var asyncawait_1 = require('asyncawait');
__export(require('./route-pattern'));
__export(require('./route-family'));
function delay(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}
exports.main = asyncawait_1.async(() => {
    console.log(111);
    asyncawait_1.await(delay(500));
    console.log(222);
    asyncawait_1.await(delay(500));
    console.log(333);
    asyncawait_1.await(delay(500));
    return 'done';
});
//# sourceMappingURL=index.js.map
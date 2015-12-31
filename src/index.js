var asyncawait_1 = require('asyncawait');
exports.RoutePattern = require('./route-pattern-2');
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
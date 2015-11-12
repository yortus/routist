var asyncawait_1 = require('asyncawait');
function delay(ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    });
}
exports.main = asyncawait_1.async(function () {
    console.log(111);
    asyncawait_1.await(delay(500));
    console.log(222);
    asyncawait_1.await(delay(500));
    console.log(333);
    asyncawait_1.await(delay(500));
    return 'done';
});
//# sourceMappingURL=index.js.map
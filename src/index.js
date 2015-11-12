var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, Promise, generator) {
    return new Promise(function (resolve, reject) {
        generator = generator.call(thisArg, _arguments);
        function cast(value) { return value instanceof Promise && value.constructor === Promise ? value : new Promise(function (resolve) { resolve(value); }); }
        function onfulfill(value) { try { step("next", value); } catch (e) { reject(e); } }
        function onreject(value) { try { step("throw", value); } catch (e) { reject(e); } }
        function step(verb, value) {
            var result = generator[verb](value);
            result.done ? resolve(result.value) : cast(result.value).then(onfulfill, onreject);
        }
        step("next", void 0);
    });
};
function delay(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}
function main() {
    return __awaiter(this, void 0, Promise, function* () {
        console.log(111);
        yield delay(500);
        console.log(222);
        yield delay(500);
        console.log(333);
        yield delay(500);
        return 'done';
    });
}
exports.main = main;
//# sourceMappingURL=index.js.map
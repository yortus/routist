




// TODO: doc...
export default function declarationsFor(obj: object) {
    let result: Array<{subjects: string; operations: string; policy: string|Function}>;
    if (map.has(obj)) {
        result = map.get(obj)!;
    }
    else {
        result = [];
        map.set(obj, result);
    }
    return result;
}





// TODO: doc...
const map = new WeakMap<object, any[]>();

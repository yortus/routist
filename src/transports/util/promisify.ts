




export default function promisify(fn: Function) {
    return (...args) => {
        return new Promise<any>((resolve, reject) => {
            fn(...args, (err, result) => {
                err ? reject(err) : resolve(result);
            });
        });
    };
}

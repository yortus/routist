import {async, await} from 'asyncawait';
export * from './route-pattern';


function delay(ms: number) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}


export var main = async (() => {
    console.log(111);
    await (delay(500));
    console.log(222);
    await (delay(500));
    console.log(333);
    await (delay(500));
    return 'done';
});

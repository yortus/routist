//import routist = require('..');
import {expect} from 'chai';


describe('it', () => {
    // it('works', done => {
    //     routist.main().then(result => {
    //         console.log(result);
    //         done()
    //     });        
    // });


    it('works', () => {

        var tests = [
            'ab* ∩ *b',
            'f*o*o*z ∩ foo*baz',
            'f*o*o*baz ∩ foo*z',
            'ab*b ∩ a*bc',
            'ab*b ∩ a*bc*',
            '*m*n* ∩ *n*m*',
            '*m*n* ∩ *n*m*n*'
        ];        

        tests.forEach(test => {
            let [a, b] = test.split(' ∩ ');
            let unifications = getUnifications(a, b);
            let isEliminated = unifications.map(u => false);
            for (let i = 0; i < unifications.length; ++i) {
                if (isEliminated[i]) continue;

                let u = unifications[i];
                let reText = u.split('').map(c => c === '*' ? '.*' : (((/*TODO*/c)))).join('');
                let re = new RegExp(`^${reText}$`);

                for (let j = 0; j < unifications.length; ++j) {
                    if (i === j) continue;
                    if (isEliminated[j]) continue;
                    let v = unifications[j];
                    isEliminated[j] = re.test(v);
                }
            }

            unifications = unifications.filter((_, i) => !isEliminated[i]);
            let result = unifications.length === 1 ? unifications[0] : '∅';
            
            console.log(`${test}   ==>   ${result}`);
        });
    });
});


function getUnifications(a: string, b: string): string[] {
    const EMPTY = [];
    let aHead = a.charAt(0);
    let bHead = b.charAt(0);
    let aTail = a.slice(1);
    let bTail = b.slice(1);

    if (aHead === '') {
        if (bHead === '') {
            return [''];
        }
        else if (bHead === '*') {
            return bTail ? EMPTY : [''];
        }
        else /* bHead === some literal char */ {
            return EMPTY;
        }
    }
    else if (aHead === '*') {
        if (bHead === '') {
            return aTail ? EMPTY : [''];
        }
        // else if (bHead === '*') {
        //     return getUnifications(a, bTail).map(u => '*' + u);
        // }
        else /* bHead === some literal char */ {
            let result: string[] = [];
            for (let n = 0; n <= b.length; ++n) {
                let bh = b.slice(0, n), bt = b.slice(n);
                if (bh.slice(-1) === '*') bt = '*' + bt;
                let more = getUnifications(aTail, bt).map(u => bh + u);
                result.push.apply(result, more);
            }
            return result;
        }
    }
    else /* aHead === some literal char */ {
        if (bHead === '') {
            return EMPTY;
        }
        else if (bHead === '*') {
            return getUnifications(b, a);
        }
        else /* bHead === some literal char */ {
            if (aHead !== bHead) return EMPTY;
            return getUnifications(aTail, bTail).map(u => aHead + u);
        }
    }
}

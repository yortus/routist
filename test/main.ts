import routist = require('..'); // TODO: use public API... But need to copy index.d.ts to /built to do that
import {expect} from 'chai';


describe('it', () => {
    it('works', done => {

        routist.main().then(result => {
            console.log(result);
            done()
        });        
    });
});

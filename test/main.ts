import routist = require('..');
import {expect} from 'chai';


describe('it', () => {
    it('works', done => {

        routist.main().then(result => {
            console.log(result);
            done()
        });        
    });
});

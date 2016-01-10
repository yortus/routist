'use strict';
var __1 = require('..');
describe('a RouteFamily instance', () => {
    it('works', () => {
        var patterns = [
            '/foo',
            '/bar',
            '/foo/*.html',
            '/foo/bar',
            '/foo/….html',
            '/…o…o….html',
            '/…o…o…'
        ];
        let expected = `…
              /bar
              /…o…o…
                /foo
                /foo/bar
                /…o…o….html
                  /foo/….html
                    /foo/*.html`;
        let family = new __1.RouteFamily(__1.RoutePattern.ALL);
        patterns.forEach(test => {
            let pattern = new __1.RoutePattern(test);
            family.add(pattern);
        });
        let actual = family.toString();
        //expect(actual).equals(expected.replace(/\n            /g, '\n'));
        console.log(actual);
    });
});
//# sourceMappingURL=route-family.js.map
//import {RoutePattern} from '..';
import {expect} from 'chai';
import {unify} from '../src/route-pattern-3';
class RoutePattern {
    constructor(public p: string) {
    }
    canonical = this.p.slice(1);
    intersectWith(other: RoutePattern) {
        var u = unify(this.canonical, other.canonical);
        return new RoutePattern(`/${u}`);
    }
}


describe('A RoutePattern instance', () => {
//     it('works', () => {
// 
//         var p0 = new RoutePattern('GET /api/foo');
//         var p1 = new RoutePattern('GET /api/foo/bar');
//         var p2 = new RoutePattern('GET /api/foo/**');
//         var p3 = new RoutePattern('GET /api/foo/{...rest}');
//         var p4 = new RoutePattern('GET /api/f*');
//         var p5 = new RoutePattern('GET /api/{fo}o');
//         var p6 = new RoutePattern('GET /**/{name}.{ext}');
//         var p7 = new RoutePattern('GET /{...path}/{name}.{ext}');
// 
//         expect(p0.canonical).equals('GET /api/foo');
//         expect(p1.canonical).equals('GET /api/foo/bar');
//         expect(p2.canonical).equals('GET /api/foo…');
//         expect(p3.canonical).equals('GET /api/foo…');
//         expect(p4.canonical).equals('GET /api/f*');
//         expect(p5.canonical).equals('GET /api/*o');
//         expect(p6.canonical).equals('GET …/*.*');
//         expect(p7.canonical).equals('GET …/*.*');
//     });


    it('works II', () => {

        // TODO: reinstate HTTP methods, ie 'GET /foo/**'
//         var p0 = new RoutePattern('/foo/bar/*');
//         var p1 = new RoutePattern('/foo/*/baz');
//         var p2 = new RoutePattern('/*/bar/baz');
//         var p3 = new RoutePattern('/fozo/*/*');
//         var p4 = new RoutePattern('/*/bar/*');
//         var p5 = new RoutePattern('/*/*/baz');
//         var p6 = new RoutePattern('/*/*/b*');
//         var p7 = new RoutePattern('/*/*/*z');
//         var p8 = new RoutePattern('/foo/bar/b*');
//         var p9 = new RoutePattern('/foo/bar/*z');
// 
//         var q0 = new RoutePattern('/**');
//         var q1 = new RoutePattern('/**/*z');
//         var q2 = new RoutePattern('/foo/**/bar/baz');
//         var q3 = new RoutePattern('/*o*/**');
// 
        var p0 = new RoutePattern('/*a*');
        var p1 = new RoutePattern('/*a*a*');
        var p2 = new RoutePattern('/*aa*');
        var p3 = new RoutePattern('/a*');
        var p4 = new RoutePattern('/*a');

//         expect(p0.intersectWith(p1).canonical).equals('/foo/bar/baz');
//         expect(p1.intersectWith(p7).canonical).equals('/foo/*/baz');
//         expect(p6.intersectWith(p9).canonical).equals('/foo/bar/b*z');
// 
//         expect(q0.intersectWith(q0).canonical).equals('…');
//         expect(p0.intersectWith(q0).canonical).equals('/foo/bar/*');
//         expect(q0.intersectWith(p0).canonical).equals('/foo/bar/*');
//         expect(p0.intersectWith(q1).canonical).equals('/foo/bar/*z');
//         expect(p4.intersectWith(q2).canonical).equals('/foo/bar/baz');
//         expect(q1.intersectWith(q1).canonical).equals('…/*z');

//         var ps = [p0, p1, p2, p3, p4, p5, p6, p7, p8, p9, q0, q1, q2, q3];
        var ps = [p0, p1, p2, p3, p4];
        ps.forEach(pa => {
            ps.forEach(pb => {
                var pc = pa.intersectWith(pb);
                console.log(`${pa.canonical} ∩ ${pb.canonical} ≡ ${pc.canonical}`);
            })
        })
    });
});

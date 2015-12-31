class RouteSegment {
    constructor(ast) {
        this.ast = ast;
        debugger;
        let canonical = ast.filter((_, i) => i % 2 === 0).join('*');
        this.canonical = '/' + canonical;
        this.regex = new RegExp(`^${canonical.replace(/[.-]/g, s => '\\' + s).replace(/\*/g, '.*')}$`);
    }
    intersectWith(other) {
        return null;
        //         if (a.terms.length === 1) {
        //             throw new Error('Not implemented');
        //             // b.length === 1 && a === b
        //             // for i=0..b.len-1:
        //             //   ix = a.indexOf(b[i], ix)
        //             //   if ix === -1 return null
        //         }
        //         if (b.terms.length === 1) {
        //             throw new Error('Not implemented');
        //             // as above...
        //         }
        // 
        //         var x = unifyRest(a.terms, b.terms);
        //         if (x === null) return null;
        // 
        //         //assert(x.length >= 2 && x[0].startsWith('^') && x[x.length - 1].endsWith('$'));
        // 
        //         return x.join('*').slice(1, -1);
    }
    toString() {
        return this.canonical;
    }
}
module.exports = RouteSegment;
//# sourceMappingURL=route-segment.js.map
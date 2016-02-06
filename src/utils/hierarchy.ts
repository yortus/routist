'use strict';





export default Hierarchy;
interface Hierarchy<T> extends Map<T, Hierarchy<T>> { }

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Slate_1 = require("./Slate");
const dep1 = new Slate_1.Slate(() => 5);
const dep2 = new Slate_1.Slate({ a: 5 });
const mult = new Slate_1.Slate(([d1, d2]) => d1 * d2.a, [dep1, dep2]);
const isEven = new Slate_1.Slate(([d]) => !(d % 2), [mult]);
const isEvenString = new Slate_1.Slate(([d]) => (d ? "ja" : "nej"), [isEven]);
mult.listen((v) => {
    console.log("mult", v);
});
isEven.listen((v) => {
    console.log("isEven", v);
});
isEvenString.listen((v) => {
    console.log("isEvenString", v);
});
console.log(mult.value);
dep1.set(50);
dep2.set({ a: 7 });
dep1.set(3);
console.log(mult.value);
dep1.set(dep1.value + 1);
dep1.set(dep1.value + 1);
dep1.set(dep1.value + 1);

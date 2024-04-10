import { Slate } from ".";

const dep1 = new Slate(5);
const dep2 = new Slate({ a: 5 });

const mult = new Slate(([d1, d2]) => d1 * d2.a, [dep1, dep2] as const);
const isEven = new Slate(([d]) => !(d % 2), [mult]);
const isEvenString = new Slate(([d]) => (d ? "ja" : "nej"), [isEven]);

mult.listen((v) => {
  console.log("mult", v);
});
isEven.listen((v) => {
  console.log("isEven", v);
});
const cancel = isEvenString.listen((v) => {
  console.log("isEvenString", v);
});

console.log(mult.value);

dep1.set(50);
dep2.set({ a: 7 });
dep1.set(3);

console.log(mult.value);
cancel();

dep1.set(() => 14);

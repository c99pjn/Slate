import { Slate } from "./Slate";

type Dep2State = {
  a: number;
};

const dep1 = new Slate(() => 5);
const dep2 = new Slate<Dep2State>({ a: 5 });

const mult = new Slate((d1, d2) => d1 * d2.a, [dep1, dep2]);
const isEven = new Slate((d) => !(d % 2), [mult]);
const isEvenString = new Slate((d) => (d ? "yes" : "no"), [isEven]);

mult.listen((v) => console.log("mult", v));

const cancel = isEven.listen((v) => {
  console.log("isEven", v);
});
isEvenString.listen((v) => {
  console.log("isEvenString", v);
});

dep1.set(50);
dep2.set({ a: 7 });

console.log("dep1", dep1.value);

dep1.set(3);

cancel();
dep1.set((v) => v + 1);
dep1.set((v) => v + 1);
dep1.set((v) => v + 1);

console.log("dep1", dep1.value);
console.log("dep2", dep2.value);
console.log("mult", mult.value);
console.log("isEven", isEven.value);
console.log("isEvenString", isEvenString.value);

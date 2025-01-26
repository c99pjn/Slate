import { Slate, resetAllSlates } from "./Slate";

const root = new Slate(1);

for (let i = 0; i < 10; i++) {
  const test = new Slate((d) => d + i, [root]);
}

console.log(root.value);
/*
const one = new Slate(() => 5);
const two = new Slate({ a: 10, b: 10 });
const three = new Slate((d1, d2) => d1 + d2.b, [one, two] as const);
console.log(one.value, two.value, three.value);

one.set(20);
two.set((v) => ({ ...v, b: 20 }));

console.log(one.value, two.value, three.value);

resetAllSlates();
console.log(one.value, two.value, three.value);
*/
//const root = new Slate(0);

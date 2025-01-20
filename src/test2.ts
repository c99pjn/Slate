import { Slate } from "./Slate";

const root = new Slate(1);

for (let i = 0; i < 10; i++) {
  const test = new Slate((d) => d + i, [root]);
}

console.log(root.value);

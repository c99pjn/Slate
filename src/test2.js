"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Slate_1 = require("./Slate");
const root = new Slate_1.Slate(1);
for (let i = 0; i < 10; i++) {
    const test = new Slate_1.Slate((d) => d + i, [root]);
}
console.log(root.value);

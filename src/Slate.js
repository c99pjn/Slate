"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Slate = void 0;
const defaultIsEqual = (v1, v2) => Object.is(v1, v2);
class Slate {
    initilizer;
    dependancies;
    isEqual;
    _value;
    _cbs = new Set();
    _listeners = [];
    constructor(initilizer, dependancies = [], isEqual = defaultIsEqual) {
        this.initilizer = initilizer;
        this.dependancies = dependancies;
        this.isEqual = isEqual;
        this._value = this.resolveValue();
    }
    resolveValue() {
        return typeof this.initilizer === "function"
            ? // @ts-ignore
                this.initilizer(this.dependancies.map((d) => d.value))
            : this.initilizer;
    }
    setValue() {
        const newValue = this.resolveValue();
        if (!this.isEqual(newValue, this._value)) {
            this._value = newValue;
            this._cbs.forEach((cb) => cb(this._value));
        }
    }
    get value() {
        return this._value;
    }
    set(initilizer) {
        this.initilizer = initilizer;
        this.setValue();
    }
    listen(cb) {
        if (this._cbs.size === 0) {
            this._listeners = this.dependancies.map((d) => d.listen(this.setValue.bind(this)));
        }
        this._cbs.add(cb);
        return () => {
            this._cbs.delete(cb);
            if (this._cbs.size === 0) {
                while (this._listeners.length)
                    this._listeners.pop()?.();
            }
        };
    }
}
exports.Slate = Slate;

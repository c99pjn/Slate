"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Slate = void 0;
const defaultIsEqual = (v1, v2) => Object.is(v1, v2);
class Slate {
    initilizer;
    dependancies;
    isEqual;
    _value;
    _dirty = false;
    _lCbs = new Set();
    _wCbs = new Set();
    constructor(initilizer, dependancies = [], isEqual = defaultIsEqual) {
        this.initilizer = initilizer;
        this.dependancies = dependancies;
        this.isEqual = isEqual;
        this._value = this.resolveValue();
        this.dependancies.map((d) => d.watch(this.update.bind(this)));
    }
    resolveValue() {
        return this.initilizer instanceof Function
            ? //@ts-ignore
                this.initilizer(this.dependancies.map((d) => d.value))
            : this.initilizer;
    }
    setValue() {
        const newValue = this.resolveValue();
        if (!this.isEqual(this._value, newValue)) {
            this._value = newValue;
            this._lCbs.forEach((cb) => cb(this._value));
        }
        this._dirty = false;
    }
    update() {
        this._dirty = true;
        if (this._lCbs.size > 0)
            this.setValue();
        this._wCbs.forEach((cb) => cb());
    }
    get value() {
        if (this._dirty) {
            this.setValue();
        }
        return this._value;
    }
    set(initilizer) {
        this.initilizer = initilizer;
        this.update();
    }
    listen(cb) {
        this._lCbs.add(cb);
        return () => this._lCbs.delete(cb);
    }
    watch(cb) {
        this._wCbs.add(cb);
        return () => this._wCbs.delete(cb);
    }
}
exports.Slate = Slate;

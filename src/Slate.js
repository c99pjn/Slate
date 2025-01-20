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
    _dW = null;
    constructor(initilizer, dependancies = [], isEqual = defaultIsEqual) {
        this.initilizer = initilizer;
        this.dependancies = dependancies;
        this.isEqual = isEqual;
        this._value = this.resolveValue();
    }
    addCallback(set, cb) {
        set.add(cb);
        this._dW =
            this._dW ?? this.dependancies.map((d) => d.watch(this.update.bind(this)));
        return () => {
            set.delete(cb);
            const noListeners = this._lCbs.size === 0 && this._wCbs.size === 0;
            if (this._dW && noListeners)
                this._dW.forEach((d) => d());
        };
    }
    resolveValue() {
        return this.initilizer instanceof Function
            ? //@ts-ignore
                this.initilizer(...this.dependancies.map((d) => d.value))
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
        if (this._dirty)
            this.setValue();
        return this._value;
    }
    setInitilizer(initilizer) {
        this.initilizer = initilizer;
        this.update();
    }
    set(setter) {
        this.initilizer = setter instanceof Function ? setter(this.value) : setter;
        this.update();
    }
    listen(cb) {
        return this.addCallback(this._lCbs, cb);
    }
    watch(cb) {
        return this.addCallback(this._wCbs, cb);
    }
}
exports.Slate = Slate;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Slate = exports.resetAllSlates = void 0;
const slateSet = new Set();
const resetAllSlates = () => slateSet.forEach((ref) => ref.deref()?.reset());
exports.resetAllSlates = resetAllSlates;
const defaultIsEqual = (v1, v2) => Object.is(v1, v2);
class Slate {
    initilizer;
    dependancies;
    isEqual;
    _curValue;
    initialInitializer;
    listenCbs = new Set();
    depCancels = null;
    constructor(initilizer, dependancies = [], isEqual = defaultIsEqual) {
        this.initilizer = initilizer;
        this.dependancies = dependancies;
        this.isEqual = isEqual;
        this._curValue = this.value;
        this.initialInitializer = this.initilizer;
        slateSet.add(new WeakRef(this));
    }
    update() {
        const newValue = this.value;
        if (!this.isEqual(this._curValue, newValue)) {
            this._curValue = newValue;
            this.listenCbs.forEach((cb) => cb(this._curValue));
        }
    }
    get value() {
        return this.initilizer instanceof Function
            ? //@ts-ignore
                this.initilizer(...this.dependancies.map((d) => d.value))
            : this.initilizer;
    }
    reset() {
        this.initilizer = this.initialInitializer;
    }
    set(setter) {
        this.initilizer = setter instanceof Function ? setter(this.value) : setter;
        this.update();
    }
    listen(cb) {
        this.listenCbs.add(cb);
        this.depCancels ??= this.dependancies.map((d) => d.listen(this.update.bind(this)));
        return () => {
            this.listenCbs.delete(cb);
            if (this.listenCbs.size === 0) {
                this.depCancels?.forEach((c) => c());
                this.depCancels = null;
            }
        };
    }
}
exports.Slate = Slate;

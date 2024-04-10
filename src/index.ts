type Cancel = () => void;
type Callback<T> = (v: T) => void;
type Comparator<T> = (v1: T, v2: T) => boolean;
type Values<S> = {
  [Key in keyof S]: S[Key] extends Slate<infer T, any> ? T : never;
};

const defaultComparator = (v1: unknown, v2: unknown) => Object.is(v1, v2);

export class Slate<T, S extends ReadonlyArray<Slate<any, any>> = never[]> {
  private _value: T;
  private _cbs = new Set<Callback<T>>();
  private _listeners: Array<Cancel> = [];

  constructor(
    private initilizer: ((deps: Values<S>) => T) | T,
    private dependancies: S | never[] = [],
    private comparator: Comparator<T> = defaultComparator,
  ) {
    this._value = this.resolveValue();
  }

  private resolveValue() {
    return typeof this.initilizer === "function"
      ? // @ts-ignore
        this.initilizer(this.dependancies.map((d) => d.value) as Values<S>)
      : this.initilizer;
  }

  private setValue() {
    const newValue = this.resolveValue();

    if (!this.comparator(newValue, this._value)) {
      this._value = newValue;
      this._cbs.forEach((cb) => cb(this._value));
    }
  }

  get value() {
    return this._value;
  }

  public set(initilizer: ((deps: Values<S>) => T) | T) {
    this.initilizer = initilizer;
    this.setValue();
  }

  public listen(cb: Callback<T>): Cancel {
    if (this._cbs.size === 0) {
      this._listeners = this.dependancies.map((d) =>
        d.listen(this.setValue.bind(this)),
      );
    }

    this._cbs.add(cb);
    return () => {
      this._cbs.delete(cb);
      if (this._cbs.size === 0) {
        while (this._listeners.length) this._listeners.pop()?.();
      }
    };
  }
}

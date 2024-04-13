type Cancel = () => void;
type Callback<T> = (v: T) => void;
type isEqual<T> = (oldValue: T, newValue: T) => boolean;
type Dependency<T> = { listen: (cb: Callback<T>) => Cancel };
type Dependencies<S> = {
  [Key in keyof S]: Dependency<S[Key]>;
};

export interface ISlate<T, S> {
  value: T;
  set: (initilizer: ((deps: S) => T) | T) => void;
  listen: (cb: Callback<T>) => Cancel;
}

const defaultIsEqual = (v1: unknown, v2: unknown): boolean => Object.is(v1, v2);

export class Slate<T, S extends Array<unknown> = never[]>
  implements ISlate<T, S>
{
  private _value: T;
  private _cbs = new Set<Callback<T>>();
  private _listeners: Array<Cancel> = [];

  constructor(
    private initilizer: ((deps: S) => T) | T,
    private dependancies: Dependencies<S> | never[] = [],
    private isEqual: isEqual<T> = defaultIsEqual,
  ) {
    this._value = this.resolveValue();
  }

  private resolveValue(): T {
    return typeof this.initilizer === "function"
      ? // @ts-ignore
        this.initilizer(this.dependancies.map((d) => d.value))
      : this.initilizer;
  }

  private setValue(): void {
    const newValue = this.resolveValue();

    if (!this.isEqual(newValue, this._value)) {
      this._value = newValue;
      this._cbs.forEach((cb) => cb(this._value));
    }
  }

  get value(): T {
    return this._value;
  }

  public set(initilizer: ((deps: S) => T) | T): void {
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

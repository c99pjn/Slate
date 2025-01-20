type Cancel = () => void;
type ListenCallback<T> = (value: T) => void;
type WatchCallback = () => void;
type IsEqual<T> = (oldValue: T, newValue: T) => boolean;
type Dependency<T> = { watch: (cb: () => void) => Cancel; value: T };
type Dependencies<S extends readonly unknown[]> = {
  readonly [Key in keyof S]: Dependency<S[Key]>;
};
type Initializer<T, S extends readonly unknown[]> = ((...deps: S) => T) | T;
type Setter<T> = ((prevValue: T) => T) | T;

export interface ISlate<T, S extends readonly unknown[]> {
  value: T;
  set: (setter: Setter<T>) => void;
  setInitilizer: (initilizer: Initializer<T, S>) => void;
  listen: (cb: ListenCallback<T>) => Cancel;
  watch: (cb: WatchCallback) => Cancel;
}

const defaultIsEqual = (v1: unknown, v2: unknown): boolean => Object.is(v1, v2);

export class Slate<T, S extends readonly unknown[]> implements ISlate<T, S> {
  private _value: T;
  private _dirty: boolean = false;
  private _lCbs = new Set<ListenCallback<T>>();
  private _wCbs = new Set<WatchCallback>();
  private _dW: Array<Cancel> | null = null;

  constructor(
    private initilizer: Initializer<T, S>,
    private dependancies: Dependencies<S> | never[] = [],
    private isEqual: IsEqual<T> = defaultIsEqual
  ) {
    this._value = this.resolveValue();
  }

  private addCallback<T>(set: Set<T>, cb: T): Cancel {
    set.add(cb);
    this._dW =
      this._dW ?? this.dependancies.map((d) => d.watch(this.update.bind(this)));
    return () => {
      set.delete(cb);
      const noListeners = this._lCbs.size === 0 && this._wCbs.size === 0;
      if (this._dW && noListeners) this._dW.forEach((d) => d());
    };
  }

  private resolveValue(): T {
    return this.initilizer instanceof Function
      ? //@ts-ignore
        this.initilizer(...this.dependancies.map((d) => d.value))
      : this.initilizer;
  }

  private setValue(): void {
    const newValue = this.resolveValue();

    if (!this.isEqual(this._value, newValue)) {
      this._value = newValue;
      this._lCbs.forEach((cb) => cb(this._value));
    }
    this._dirty = false;
  }

  private update(): void {
    this._dirty = true;
    if (this._lCbs.size > 0) this.setValue();
    this._wCbs.forEach((cb) => cb());
  }

  get value(): T {
    if (this._dirty) this.setValue();
    return this._value;
  }

  public setInitilizer(initilizer: Initializer<T, S>): void {
    this.initilizer = initilizer;
    this.update();
  }

  public set(setter: Setter<T>): void {
    this.initilizer = setter instanceof Function ? setter(this.value) : setter;
    this.update();
  }

  public listen(cb: ListenCallback<T>): Cancel {
    return this.addCallback(this._lCbs, cb);
  }

  public watch(cb: WatchCallback): Cancel {
    return this.addCallback(this._wCbs, cb);
  }
}

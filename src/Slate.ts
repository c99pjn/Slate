type Cancel = () => void;
type ListenCallback<T> = (value: T) => void;
type Listener<T> = (cb: ListenCallback<T>) => Cancel;
type WatchCallback = () => void;
type Watcher = (cb: WatchCallback) => Cancel;
type isEqual<T> = (oldValue: T, newValue: T) => boolean;
type Dependency<T> = { watch: (cb: () => void) => Cancel; value: T };
type Dependencies<S extends readonly unknown[]> = {
  readonly [Key in keyof S]: Dependency<S[Key]>;
};
type Initializer<T, S extends readonly unknown[]> = ((...deps: S) => T) | T;
type SetInitilizer<T, S extends readonly unknown[]> = (
  initilizer: Initializer<T, S>
) => void;
type Setter<T> = ((prevValue: T) => T) | T;
type Set<T> = (setter: Setter<T>) => void;

export interface ISlate<T, S extends readonly unknown[]> {
  value: T;
  set: Set<T>;
  setInitilizer: SetInitilizer<T, S>;
  listen: Listener<T>;
  watch: Watcher;
}

const defaultIsEqual = (v1: unknown, v2: unknown): boolean => Object.is(v1, v2);

export class Slate<T, S extends readonly unknown[]> implements ISlate<T, S> {
  private _value: T;
  private _dirty: boolean = false;
  private _lCbs = new Set<ListenCallback<T>>();
  private _wCbs = new Set<WatchCallback>();

  constructor(
    private initilizer: Initializer<T, S>,
    private dependancies: Dependencies<S> | never[] = [],
    private isEqual: isEqual<T> = defaultIsEqual
  ) {
    this._value = this.resolveValue();
    this.dependancies.map((d) => d.watch(this.update.bind(this)));
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
    this._lCbs.add(cb);
    return () => this._lCbs.delete(cb);
  }

  public watch(cb: WatchCallback): Cancel {
    this._wCbs.add(cb);
    return () => this._wCbs.delete(cb);
  }
}

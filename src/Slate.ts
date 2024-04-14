type Cancel = () => void;
type ListenCallback<T> = (value: T) => void;
type Listener<T> = (cb: ListenCallback<T>) => Cancel;
type WatchCallback = () => void;
type Watcher = (cb: WatchCallback) => Cancel;
type isEqual<T> = (oldValue: T, newValue: T) => boolean;
type Dependency<T> = { watch: (cb: () => void) => Cancel; value: T };
type Dependencies<S> = {
  [Key in keyof S]: Dependency<S[Key]>;
};
type Initializer<T, S> = ((deps: S) => T) | T;
type Setter<T, S> = (initilizer: Initializer<T, S>) => void;

export interface ISlate<T, S> {
  value: T;
  set: Setter<T, S>;
  listen: Listener<T>;
  watch: Watcher;
}

const defaultIsEqual = (v1: unknown, v2: unknown): boolean => Object.is(v1, v2);

export class Slate<T, S extends Array<unknown> = never[]>
  implements ISlate<T, S>
{
  private _value: T;
  private _dirty: boolean = false;
  private _lCbs = new Set<ListenCallback<T>>();
  private _wCbs = new Set<WatchCallback>();

  constructor(
    private initilizer: Initializer<T, S>,
    private dependancies: Dependencies<S> | never[] = [],
    private isEqual: isEqual<T> = defaultIsEqual,
  ) {
    this._value = this.resolveValue();
    this.dependancies.map((d) => d.watch(this.update.bind(this)));
  }

  private resolveValue(): T {
    return this.initilizer instanceof Function
      ? //@ts-ignore
        this.initilizer(this.dependancies.map((d) => d.value))
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

  public set(initilizer: Initializer<T, S>): void {
    this.initilizer = initilizer;
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

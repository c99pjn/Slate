type Cancel = () => void;
type ListenCallback<T> = (value: T) => void;
type IsEqual<T> = (oldValue: T, newValue: T) => boolean;
type Dependency<T> = { listen: (cb: () => void) => Cancel; value: T };
type Dependencies<S extends readonly unknown[]> = {
  readonly [Key in keyof S]: Dependency<S[Key]>;
};
type Initializer<T, S extends readonly unknown[]> = ((...deps: S) => T) | T;
type Setter<T> = ((curValue: T) => T) | T;

const slateSet = new Set<WeakRef<{ reset: () => void }>>();
export const resetAllSlates = () =>
  slateSet.forEach((ref) => ref.deref()?.reset());

const defaultIsEqual = (v1: unknown, v2: unknown): boolean => Object.is(v1, v2);

export class Slate<T, const S extends readonly unknown[] = readonly []> {
  private _curValue: T;
  private initialInitializer: Initializer<T, S>;
  private listenCbs = new Set<ListenCallback<T>>();
  private depCancels: Array<Cancel> | null = null;

  constructor(
    private initilizer: Initializer<T, S>,
    private readonly dependancies: Dependencies<S> | never[] = [],
    private readonly isEqual: IsEqual<T> = defaultIsEqual
  ) {
    this._curValue = this.value;
    this.initialInitializer = this.initilizer;
    slateSet.add(new WeakRef(this));
  }

  private update(): void {
    const newValue = this.value;

    if (!this.isEqual(this._curValue, newValue)) {
      this._curValue = newValue;
      this.listenCbs.forEach((cb) => cb(this._curValue));
    }
  }

  get value(): T {
    return this.initilizer instanceof Function
      ? //@ts-ignore
        this.initilizer(...this.dependancies.map((d) => d.value))
      : this.initilizer;
  }

  public reset(): void {
    this.initilizer = this.initialInitializer;
  }

  public set(setter: Setter<T>): void {
    this.initilizer = setter instanceof Function ? setter(this.value) : setter;
    this.update();
  }

  public listen(cb: ListenCallback<T>): Cancel {
    this.listenCbs.add(cb);
    this.depCancels ??= this.dependancies.map((d) =>
      d.listen(this.update.bind(this))
    );

    return () => {
      this.listenCbs.delete(cb);
      if (this.listenCbs.size === 0) {
        this.depCancels?.forEach((c) => c());
        this.depCancels = null;
      }
    };
  }
}

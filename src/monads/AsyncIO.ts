import { Monad } from '../types'

/**
 * Async IO Monad
 *
 * The Async IO monad captures side‑effectful async computations in a safe, referentially
 * transparent wrapper that can be composed without executing the effects
 * until `.run()` is invoked.
 *
 * @example
 * type Unit = void;
 * const now: IO<Date> = IO.from(() => new Date());
 *
 * const putStrLn = (msg: string): IO<Unit> => IO.from(() => {
 *   console.log(msg);
 * });
 *
 * const showTime: IO<Unit> = now
 *   .map(date => date.toISOString())
 *   .flatMap(putStrLn);
 *
 * showTime.run();
 */
export class AsyncIO<A> implements Monad<A> {
  private constructor(private readonly effect: () => Promise<A>) {}

  /* -----------------------------------------------------------------------
   * Static constructors
   * -------------------------------------------------------------------- */

  /** Pure lifts a value in to the AsyncIO context */
  static of<A>(value: A): AsyncIO<A> {
    return new AsyncIO(() => Promise.resolve(value))
  }

  /** Wrap a side effect in AsyncIO */
  static from<A>(effect: () => Promise<A>): AsyncIO<A> {
    return new AsyncIO(effect)
  }


  /* -----------------------------------------------------------------------
   * Monad operations
   * -------------------------------------------------------------------- */

  /** Execute the encapsulated side effect and obtain its result */
  run(): Promise<A> {
    return this.effect()
  }

  /**
   * Map the value.
   * @typeParam B New value type
   */
  map<B>(f: (a: A) => B): AsyncIO<B> {
    return new AsyncIO(() => this.effect().then(f))
  }

  /**
   * Monad bind / flatMap / chain.
   * @typeParam B New value type
   */
  flatMap<B>(f: (a: A) => AsyncIO<B>): AsyncIO<B> {
    return new AsyncIO(() => this.effect().then((a) => f(a).run()))
  }

  bind = this.flatMap

  /** Perform an additional side effect with the current value, keeping the original result */
  tap(sideEffect: (a: A) => void): AsyncIO<A> {
    return new AsyncIO(() => {
      const val = this.effect()
      val.then(a => sideEffect(a))
      return val
    })
  }
}


import { Monad } from '../types'

/**
 * IO Monad
 *
 * The IO monad captures side‑effectful computations in a safe, referentially
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
export class IO<A> implements Monad<A> {
  private constructor(private readonly effect: () => A) {}

  /* -----------------------------------------------------------------------
   * Static constructors
   * -------------------------------------------------------------------- */

  /** Pure lifts a value in to the IO context */
  static of<A>(value: A): IO<A> {
    return new IO(() => value)
  }

  /** Wrap a side effect in IO */
  static from<A>(effect: () => A): IO<A> {
    return new IO(effect)
  }

  /**
   * Lift a Promise‑returning effect into IO<Promise<A>> so it can be composed
   * with other IO actions before being awaited.
   */
  static fromPromise<A>(promiseThunk: () => Promise<A>): IO<Promise<A>> {
    return new IO(promiseThunk)
  }

  /* -----------------------------------------------------------------------
   * Monad operations
   * -------------------------------------------------------------------- */

  /** Execute the encapsulated side effect and obtain its result */
  run(): A {
    return this.effect()
  }

  /**
   * Map the value.
   * @typeParam B New value type
   */
  map<B>(f: (a: A) => B): IO<B> {
    return new IO(() => f(this.effect()))
  }

  /**
   * Monad bind / flatMap / chain.
   * @typeParam B New value type
   */
  flatMap<B>(f: (a: A) => IO<B>): IO<B> {
    return new IO(() => f(this.effect()).run())
  }

  bind = this.flatMap

  /** Perform an additional side effect with the current value, keeping the original result */
  tap(sideEffect: (a: A) => void): IO<A> {
    return new IO(() => {
      const val = this.effect()
      sideEffect(val)
      return val
    })
  }
}

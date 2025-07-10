import type { Monad } from '../types'
/**
 * Do notation helper
 *
 * Do provides static helpers to interpret generator functions as monadic
 * “do” blocks.  We keep it generic by accepting the `of` constructor for the
 * underlying monad up front.
 *
 * This utility lets you write monadic code with a generator syntax that feels
 * similar to Haskell’s "do" blocks.  You yield monadic values inside a
 * generator, and the helper stitches the `flatMap` / `map` calls together.
 *
 * @example
 * import { IO } from './IO'
 *
 * const DoIO = Do.with(IO.of);
 *
 * const prog = DoIO(function* () {
 *  const a = yield IO.of(1);
 *  const b = yield IO.of(2);
 *  return a + b;
 * });
 *
 * const result = prog.run()
 * // result: 3
 */
export class Do {
  /**
   * Fully generic runner—pass the underlying monad’s `of` and a generator
   * function; get back a *single* monadic value that represents the whole
   * block.
   */
  static run<A>(
    of: <T>(value: T) => Monad<T>,
    gen: () => Generator<Monad<any>, A, any>
  ) {
    const iterator = gen()

    const step = (iter: IteratorResult<Monad<any>, A>): Monad<A> => {
      if (iter.done) {
        // Generator returned – lift final value into the monad
        return of(iter.value)
      }
      // There’s a yielded monad; flat‑map, feeding its result back in
      return iter.value.flatMap((val) => step(iterator.next(val)))
    }

    return step(iterator.next())
  }

  /**
   * Convenience: partially apply the monad constructor `of`, getting a helper
   * that feels *exactly* like Haskell’s `do`.
   */
  static with(of: <T>(value: T) => Monad<T>) {
    return <A>(gen: () => Generator<Monad<any>, A, any>) => Do.run(of, gen)
  }
}

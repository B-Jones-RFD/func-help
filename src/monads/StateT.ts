import { Monad, StatePair } from '../types'

/**
 * State Transformer
 *
 * This transformer lets you add mutable‑state semantics on top of an
 * *arbitrary* underlying monad (IO, Either, Promise …) without
 * executing the stateful logic until the final `run` call.
 *
 * @example
 * import { Either } from './Either'
 *
 * type Err = string
 *
 * type Wrapped<A> = Either<Err, A> // underlying monad
 * const ofEither = Either.of as <T>(t: T) => Wrapped<T>
 *
 * // Little helpers
 * const log = (msg: string): Wrapped<void> => ofEither(console.log(msg))
 *
 * // StateT on top of Either<string, _>
 * type Counter = number
 *
 * const increment = StateT.modify<Counter>((n) => n + 1, ofEither)
 * const getCount = StateT.get<Counter>(ofEither)
 * const writeLog = (msg: string) => StateT.lift(log(msg), ofEither)
 *
 * const program = increment
 *   .flatMap(() => writeLog('incremented'))
 *   .flatMap(() => increment)
 *   .flatMap(() => writeLog('incremented again'))
 *   .flatMap(() => getCount)
 *
 * // Execute with initial state 0
 * afterRun(program.run(0))
 *
 * function afterRun(result: Wrapped<StatePair<Counter, number>>) {
 *   result.match({
 *     left: (e) => console.error('Error:', e),
 *     right: ([count, finalState]) =>
 *       console.log('Result:', count, 'Final state:', finalState),
 *   })
 * }
 *
 */
export class StateT<S, A> {
  private readonly runStateT: (state: S) => Monad<StatePair<S, A>>
  private readonly Mof: <T>(value: T) => Monad<T>

  private constructor(
    run: (s: S) => Monad<StatePair<S, A>>,
    ofF: <T>(value: T) => Monad<T>
  ) {
    this.runStateT = run
    this.Mof = ofF
  }

  /** Pure */
  static of<S, A>(value: A, Mof: <T>(value: T) => Monad<T>): StateT<S, A> {
    return new StateT((s) => Mof([value, s]), Mof)
  }

  /** Lift monadic value into StateT */
  static lift<S, A>(
    ma: Monad<A>,
    Mof: <T>(value: T) => Monad<T>
  ): StateT<S, A> {
    return new StateT((s) => ma.map((a) => [a, s]), Mof)
  }

  /** Functor */
  map<B>(f: (a: A) => B): StateT<S, B> {
    return new StateT(
      (s) => this.runStateT(s).map(([a, s1]) => [f(a), s1] as StatePair<S, B>),
      this.Mof
    )
  }

  /** Monad */
  flatMap<B>(f: (a: A) => StateT<S, B>): StateT<S, B> {
    return new StateT(
      (s0) => this.runStateT(s0).flatMap(([a, s1]) => f(a).runStateT(s1)),
      this.Mof
    )
  }

  bind = this.flatMap

  /** Retrieve the current state without modifying it. */
  static get<S>(Mof: <T>(value: T) => Monad<T>): StateT<S, S> {
    return new StateT((s) => Mof([s, s]), Mof)
  }

  /** Replace the current state. */
  static put<S>(newState: S, Mof: <T>(value: T) => Monad<T>): StateT<S, void> {
    return new StateT(() => Mof([undefined, newState]), Mof)
  }

  /** Apply a transformation to the state. */
  static modify<S>(
    f: (s: S) => S,
    Mof: <T>(value: T) => Monad<T>
  ): StateT<S, void> {
    return new StateT((s) => Mof([undefined, f(s)]), Mof)
  }

  /** Project a value from the state without modifying it. */
  static gets<S, A>(
    f: (s: S) => A,
    Mof: <T>(value: T) => Monad<T>
  ): StateT<S, A> {
    return new StateT((s) => Mof([f(s), s]), Mof)
  }

  /** Obtain the underlying monad with both result and final state. */
  run(initial: S): Monad<StatePair<S, A>> {
    return this.runStateT(initial)
  }

  /** Keep only the computed result, within the wrapped monad. */
  eval(initial: S): Monad<A> {
    return this.runStateT(initial).map(([a]) => a)
  }

  /** Keep only the final state, within the wrapped monad. */
  exec(initial: S): Monad<S> {
    return this.runStateT(initial).map(([, s]) => s)
  }
}

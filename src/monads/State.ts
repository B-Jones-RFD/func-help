import type { Monad, StatePair } from '../types'

/**
 * State Monad
 *
 * Implementation of the State monad
 *
 * @example
 * type CounterState = number;
 * const increment = State.modify<CounterState>((n) => n + 1);
 * const getCount = State.get<CounterState>();
 *
 * const program = increment
 *  .flatMap(() => increment)
 *  .flatMap(() => getCount);
 *
 * const [result, finalState] = program.run(0);
 * // result === 2, finalState === 2
 */
export class State<S, A> implements Monad<A> {
  private constructor(
    private readonly runState: (state: S) => StatePair<S, A>
  ) {}

  /* -----------------------------------------------------------------------
   * Static constructors
   * -------------------------------------------------------------------- */

  /** Pure */
  static return<S, A>(value: A): State<S, A> {
    return new State((s) => [value, s])
  }

  static of<S, A>(value: A): State<S, A> {
    return this.return(value)
  }

  /* -----------------------------------------------------------------------
   * Monad operations
   * -------------------------------------------------------------------- */

  /**
   * Map the value.
   * @typeParam B New value type
   */
  map<B>(f: (a: A) => B): State<S, B> {
    return new State((s0) => {
      const [a, s1] = this.runState(s0)
      return [f(a), s1]
    })
  }

  /**
   * Monad bind / flatMap / chain.
   * @typeParam B New value type
   */
  flatMap<B>(f: (a: A) => State<S, B>): State<S, B> {
    return new State((s0) => {
      const [a, s1] = this.runState(s0)
      return f(a).runState(s1)
    })
  }

  bind = this.flatMap

  /* -----------------------------------------------------------------------
   * Execution
   * -------------------------------------------------------------------- */

  /** Run the computation and obtain both result and new state. */
  run(initial: S): StatePair<S, A> {
    return this.runState(initial)
  }

  /** Run and keep the result only (discard new state). */
  eval(initial: S): A {
    return this.runState(initial)[0]
  }

  /** Run and keep the state only (discard result). */
  exec(initial: S): S {
    return this.runState(initial)[1]
  }

  /* -----------------------------------------------------------------------
   * Extractors
   * -------------------------------------------------------------------- */

  /** Extract the underlying state function. */
  toFunction(): (state: S) => StatePair<S, A> {
    return this.runState
  }

  /** Retrieve the current state without modifying it. */
  static get<S>(): State<S, S> {
    return new State((s) => [s, s])
  }

  /** Replace the current state. */
  static put<S>(newState: S): State<S, void> {
    return new State(() => [undefined, newState])
  }

  /** Apply a transformation to the state. */
  static modify<S>(f: (s: S) => S): State<S, void> {
    return new State((s) => [undefined, f(s)])
  }

  /** Project a value from the state without modifying it. */
  static gets<S, A>(f: (s: S) => A): State<S, A> {
    return new State((s) => [f(s), s])
  }
}

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
  private readonly runState: (state: S) => StatePair<S, A>

  private constructor(runState: (state: S) => StatePair<S, A>) {
    this.runState = runState
  }

  /** Leaves the state unchanged and sets the result
   * return :: a -> State s a
   */
  static return<S, A>(value: A): State<S, A> {
    return new State((s) => [value, s])
  }

  /** Extract the underlying state function. */
  toFunction(): (state: S) => StatePair<S, A> {
    return this.runState
  }

  /** Functor 'map'. */
  map<B>(f: (a: A) => B): State<S, B> {
    return new State((s0) => {
      const [a, s1] = this.runState(s0)
      return [f(a), s1]
    })
  }

  /** Monad */
  flatMap<B>(f: (a: A) => State<S, B>): State<S, B> {
    return new State((s0) => {
      const [a, s1] = this.runState(s0)
      return f(a).runState(s1)
    })
  }

  bind = this.flatMap

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

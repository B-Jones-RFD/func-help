export interface Monad<T> {
  map<U>(f: (t: T) => U): Monad<U>
  flatMap<U>(f: (t: T) => Monad<U>): Monad<U>
}

export type Effect<A> = () => A

export type AsyncEffect<A> = () => Promise<A>

export type StatePair<S, A> = [A, S]

export type Unit = void

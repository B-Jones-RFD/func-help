import type { Monad } from '../types'

/**
 * Either Monad
 *
 * Either<L, R> represents a value that is either a Left<L> (typically an error)
 * or a Right<R> (a successful computation).  Only the Right branch is considered
 * for `map`/`flatMap` sequencing; the Left branch short‑circuits the chain.
 *
 * @example
 * type Err = string;
 *
 * const parseNumber = (s: string): Either<Err, number> => {
 *   const n = parseFloat(s);
 *   return isNaN(n) ? Either.left(`'${s}' is not a number`) : Either.right(n);
 * };
 *
 * const reciprocal = (n: number): Either<Err, number> => {
 *   return n === 0 ? Either.left('division by zero') : Either.right(1 / n);
 * };
 *
 * const program = parseNumber('10').flatMap(reciprocal);
 *
 * const result = program.fold(
 *   (err) => `Error: ${err}`,
 *   (value) => `Reciprocal is ${value}`
 * );
 * // result === 'Reciprocal is 0.1'
 */
export class Either<L, R> implements Monad<R> {
  private readonly tag: 'left' | 'right'
  private readonly value: L | R

  private constructor(tag: 'left' | 'right', value: L | R) {
    this.tag = tag
    this.value = value
  }

  /** Construct left */
  static left<L, R = never>(value: L): Either<L, R> {
    return new Either<L, R>('left', value)
  }

  /** Construct right */
  static right<R, L = never>(value: R): Either<L, R> {
    return new Either<L, R>('right', value)
  }

  /** Pure */
  static of<R>(value: R): Either<never, R> {
    return Either.right(value)
  }

  /**
   * Convert a nullable/undefinable value into an Either, using the provided
   * `onNull` thunk to create a Left value when the input is null or undefined.
   */
  static fromNullable<L, R>(
    value: R | null | undefined,
    onNull: () => L
  ): Either<L, R> {
    return value == null ? Either.left(onNull()) : Either.right(value as R)
  }

  /** Attempt to run a effect; capture thrown errors as Left<E>. */
  static tryCatch<R, E = unknown>(
    effect: () => R,
    onError?: (e: unknown) => E
  ): Either<E, R> {
    try {
      return Either.right(effect())
    } catch (e) {
      return Either.left(onError ? onError(e) : (e as E))
    }
  }

  /** Inspector */
  isLeft(): this is Either<L, never> {
    return this.tag === 'left'
  }

  /** Inspector */
  isRight(): this is Either<never, R> {
    return this.tag === 'right'
  }

  /** Functor 'map'. */
  map<B>(f: (r: R) => B): Either<L, B> {
    return this.isRight()
      ? Either.right(f(this.value as R))
      : (this as unknown as Either<L, B>)
  }

  /** Monad */
  flatMap<B>(f: (r: R) => Either<L, B>): Either<L, B> {
    return this.isRight()
      ? f(this.value as R)
      : (this as unknown as Either<L, B>)
  }

  bind = this.flatMap

  /** Fold the Either into a single value. */
  fold<B>(onLeft: (l: L) => B, onRight: (r: R) => B): B {
    return this.isRight() ? onRight(this.value as R) : onLeft(this.value as L)
  }

  /** Extract the Right value or provide a default derived from the Left. */
  getOrElse(fallback: (l: L) => R): R {
    return this.isRight() ? (this.value as R) : fallback(this.value as L)
  }

  /** Swap Left and Right branches. */
  swap(): Either<R, L> {
    return this.isRight()
      ? Either.left(this.value as R)
      : Either.right(this.value as L)
  }

  /* Pattern matching */
  match<T extends { left: (l: L) => any; right: (r: R) => any }>(
    handlers: T
  ): ReturnType<T['left']> | ReturnType<T['right']> {
    return this.isRight()
      ? handlers.right(this.value as R)
      : handlers.left(this.value as L)
  }
}

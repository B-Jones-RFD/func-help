import type { Monad } from '../types'

/**
 * Except Monad
 *
 * Except<A> is an implementation of the Either monad representing success or failure.
 * The base Error type is used for failure.
 *
 * Except<A> ≅  Error | Success<A>
 *
 * Only a success is considered for `map`/`flatMap` sequencing; errors short‑circuits the chain.
 *
 * @typeParam A success value type
 *
 * @example
 * const parseNumber = (s: string): Except<number> => {
 *   const n = parseFloat(s);
 *   return isNaN(n) ? Except.failed(new Error(`'${s}' is not a number`)) : Except.ok(n);
 * };
 *
 * const reciprocal = (n: number): Except<number> => {
 *   return n === 0 ? Except.failed(new Error('division by zero')) : Except.ok(1 / n);
 * };
 *
 * const program = parseNumber('10').flatMap(reciprocal);
 *
 * const result = program.fold(
 *   (err) => `Error: ${err.message}`,
 *   (value) => `Reciprocal is ${value}`
 * );
 * // result === 'Reciprocal is 0.1'
 */
export class Except<A> implements Monad<A> {
  private constructor(private readonly value: Error | A) {}

  /* -----------------------------------------------------------------------
   * Static constructors
   * -------------------------------------------------------------------- */

  /** Construct failed */
  static failed<A = never>(error: Error): Except<A> {
    return new Except<A>(error)
  }

  /** Construct ok */
  static ok<A>(value: A): Except<A> {
    return new Except<A>(value)
  }

  /** Pure */
  static of<A>(value: A): Except<A> {
    return Except.ok(value)
  }

  /**
   * Convert a nullable/undefinable value into an Except, using the provided
   * `onNull` thunk to create a Left value when the input is null or undefined.
   */
  static fromNullable<A>(
    value: A | null | undefined,
    onNull: () => Error
  ): Except<A> {
    return value == null ? Except.failed(onNull()) : Except.ok(value as A)
  }

  /** Attempt to run a effect; capture thrown errors as Except<A>. */
  static tryCatch<A>(
    effect: () => A,
    onError?: (e: unknown) => Error
  ): Except<A> {
    try {
      return Except.ok(effect())
    } catch (e) {
      return Except.failed(onError ? onError(e) : (e as Error))
    }
  }

  /* -----------------------------------------------------------------------
   * Inspectors
   * -------------------------------------------------------------------- */

  isError() {
    return this.value instanceof Error
  }

  isOk() {
    return !(this.value instanceof Error)
  }

  /* -----------------------------------------------------------------------
   * Functor / Monad operations
   * -------------------------------------------------------------------- */

  /**
   * Map the success value.
   * @typeParam B New success type
   */
  map<B>(f: (a: A) => B): Except<B> {
    return this.value instanceof Error
      ? (this as unknown as Except<B>)
      : Except.ok(f(this.value))
  }

  /**
   * Monad bind / flatMap / chain.
   * @typeParam B New success type
   */
  flatMap<B>(f: (a: A) => Except<B>): Except<B> {
    return this.value instanceof Error
      ? (this as unknown as Except<B>)
      : f(this.value)
  }

  bind = this.flatMap

  /* -----------------------------------------------------------------------
   * Extractors
   * -------------------------------------------------------------------- */

  /**
   * Fold the Except into a single value.
   * @param onError function to execute when Error
   * @param onSuccess function to execute when value
   */
  fold<B>(onError: (e: Error) => B, onSuccess: (a: A) => B): B {
    return this.value instanceof Error
      ? onError(this.value)
      : onSuccess(this.value)
  }

  match = this.fold

  /**
   * Extract the Right value or provide a default derived from the Left.
   * @param fallback function to execute when left type
   */
  getOrElse(fallback: (e: Error) => A): A {
    return this.value instanceof Error ? fallback(this.value) : this.value
  }
}

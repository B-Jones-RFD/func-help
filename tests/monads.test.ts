import { vi, describe, it, expect, afterAll } from 'vitest'
import { type Unit, Either, IO, State } from '../src'

describe('Either', () => {
  type Err = string

  const parseNumber = (s: string): Either<Err, number> => {
    const n = parseFloat(s)
    return isNaN(n) ? Either.left(`'${s}' is not a number`) : Either.right(n)
  }

  const reciprocal = (n: number): Either<Err, number> => {
    return n === 0 ? Either.left('division by zero') : Either.right(1 / n)
  }

  it('should pass with correct data', () => {
    const program = parseNumber('10').flatMap(reciprocal)
    const expected = 'Reciprocal is 0.1'
    const result = program.fold(
      (err) => `Error: ${err}`,
      (value) => `Reciprocal is ${value}`
    )
    expect(result).toStrictEqual(expected)
  })

  it('should error with invalid number', () => {
    const program = parseNumber('0').flatMap(reciprocal)
    const expected = 'Error: division by zero'
    const result = program.fold(
      (err) => `Error: ${err}`,
      (value) => `Reciprocal is ${value}`
    )
    expect(result).toStrictEqual(expected)
  })

  it('should error with invalid data', () => {
    const program = parseNumber('a').flatMap(reciprocal)
    const expected = "Error: 'a' is not a number"
    const result = program.fold(
      (err) => `Error: ${err}`,
      (value) => `Reciprocal is ${value}`
    )
    expect(result).toStrictEqual(expected)
  })
})

describe('IO', () => {
  const consoleMock = vi
    .spyOn(console, 'log')
    .mockImplementation(() => undefined)

  afterAll(() => {
    consoleMock.mockReset()
  })

  const now: IO<Date> = IO.from(() => new Date('1900-01-01T00:00:00'))
  const putStrLn = (msg: string): IO<Unit> =>
    IO.from(() => {
      console.log(msg)
    })

  const showTime: IO<Unit> = now
    .map((date) => date.toISOString())
    .flatMap(putStrLn)

  it('should pass with correct data', () => {
    showTime.run()
    expect(consoleMock).toBeCalledTimes(1)
    expect(consoleMock).toHaveBeenCalledWith('1900-01-01T06:00:00.000Z')
  })
})

describe('State', () => {
  type CounterState = number

  const increment = State.modify<CounterState>((n) => n + 1)
  const getCount = State.get<CounterState>()

  const program = increment.flatMap(() => increment).flatMap(() => getCount)

  it('should pass with correct data', () => {
    const expected = 2
    const [result, finalState] = program.run(0)

    expect(result).toStrictEqual(expected)
    expect(finalState).toStrictEqual(expected)
  })
})

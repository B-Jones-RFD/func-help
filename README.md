![GitHub Actions CI](https://github.com/B-Jones-RFD/func-help/actions/workflows/main.yml/badge.svg)
[![npm version](https://img.shields.io/npm/v/@b-jones-rfd/func-help.svg?style=flat-square)](https://www.npmjs.com/package/@b-jones-rfd/func-help)
[![npm bundle size](https://img.shields.io/bundlephobia/min/%40b-jones-rfd%2Ffunc-help)](https://bundlephobia.com/package/@b-jones-rfd/func-help)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

# Func Help

Helpers to perform common project tasks. This is an exercise to avoid code reuse in my own projects. Use at your own risk.

## Prerequisites

This project requires NodeJS (version >= 20) and NPM.
[Node](http://nodejs.org/) and [NPM](https://npmjs.org/) are really easy to install.
To make sure you have them available on your machine,
try running the following command.

```sh
$ npm -v && node -v
10.2.4
v20.11.1
```

[PNPM](https://pnpm.io/) is a awesome alternative to NPM and is recommended.

## Table of contents

- [Func Help](#func-help)
  - [Prerequisites](#prerequisites)
  - [Table of contents](#table-of-contents)
  - [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Usage](#usage)
  - [API](#api)
    - [Monads](#monads)
    - [Utilities](#utilities)
  - [Contributing](#contributing)
  - [Versioning](#versioning)
  - [Authors](#authors)
  - [License](#license)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

## Installation

**BEFORE YOU INSTALL:** please read the [prerequisites](#prerequisites)

To install and set up the library, run:

```sh
$ npm i @b-jones-rfd/func-help
```

Or if you prefer using Yarn:

```sh
$ yarn add @b-jones-rfd/func-help
```

Or for PNPM:

```sh
$ pnpm add @b-jones-rfd/func-help
```

## Usage

TBD

## API

### Monads

#### Either

Either represents a value that is either a Left<L> (typically an error) or a Right<R> (a successful computation).

```TS
Either<L, R>
```

#### IO

The IO monad captures side‑effectful computations in a safe, referentially transparent wrapper that can be composed without executing the effects until ".run()" is invoked.

```TS
IO<A>
```

#### State

Implementation of the State monad

```TS
State<S, A>
```

#### StateT

This transformer lets you add mutable‑state semantics on top of an _arbitrary_ underlying monad (IO, Either, Promise …) without executing the stateful logic until the final "run" call.

```TS
StateT<S, A>
```

### Utilities

#### Do

Do provides static helpers to interpret generator functions as monadic “do” blocks.

## Contributing

This is a pet project to save me time at work. It is still under development and you should use at your own risk.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/B-Jones-RFD/func-help/tags).

## Authors

- **B Jones RFD** - _Package Noob_ - [B-Jones-RFD](https://github.com/B-Jones-RFD)

## License

[MIT License](https://github.com/B-Jones-RFD/func-help/blob/main/LICENSE)

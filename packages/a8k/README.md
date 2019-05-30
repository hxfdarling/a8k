[![licens MIT](https://img.shields.io/github/license/hxfdarling/a8k.svg)](https://github.com/hxfdarling/a8k/blob/master/LICENSE)
[![travis CI](https://travis-ci.org/hxfdarling/a8k.svg?branch=master)](https://travis-ci.org/hxfdarling/a8k)

# a8k

A build tool that integrates webpack's react project best practices configuration.

[docs](https://hxfdarling.github.io/a8k/)

## Getting Started

install

```bash
npm i -g a8k
# or
npm i -D a8k
```

init project

```bash
k create [projectName]
```

start devServer

```bash
k dev
```

start devServer for ssr

```bash
k dev -s
```

build

```bash
k build
```

test

```bash
k test
```

## Development scripts

A8k is organized as a monorepo using Lerna. Useful scripts include:

### `yarn bootstrap`

Installs package dependencies and links packages together - using lerna

### `yarn release`

Push a release to git and npm will ask for version in interactive mode - using lerna.

### `yarn lint`

boolean check if code conforms to linting rules - uses remark & eslint

### `yarn test`

boolean check if unit tests all pass - uses jest

# `@applitools/logger`
## This package used to log messages.

## Installation

```sh
npm install @applitools/logger
```

## Usage

```js
const {makeLogger} = require('@applitools/logger')
const logger = makeLogger()
logger.log('hello world')
```

## API

TBD

### `FileHandler`

TBD

### `RollingFileHandler`

TBD

### `ConsoleHandler`

TBD


### `DebugHandler`

By adding the environments variable `DEBUG=appli:*` and `APPLITOOLS_SHOW_LOGS=true`you can enable debug logs.

`DebugHandler` is the `applitools` wrapper for [`debug`](https://www.npmjs.com/package/debug) package.

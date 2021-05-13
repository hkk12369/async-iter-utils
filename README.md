## async-iter-tools
Useful utilities for js async iterators.

## Install
```sh
npm install async-iter-tools
# OR
yarn add async-iter-tools
```

## Docs

#### `onItem(iterable, fn)`
convert an async iterator to callback style
```js
const {onItem} = require('async-iter-tools');

onItem(iterable, (item) => {
    console.log(item);
})
```

#### `forEach(iterable, fn, {concurrency = 1, stopOnError = true} = {})`
Run a function for each item of async iterable with given `concurrency`. If `stopOnError` is false, all errors will be collected and returned as an `AggregateError`, otherwise it'll stop on any error.
```js
const {forEach} = require('async-iter-tools');

await forEach(iterable, async (item) => {
    console.log(await process(item));
}, {concurrency: 10});
```

#### `map(iterable, fn, {concurrency = 1, stopOnError = true} = {})`
Same as `forEach` but will collect and return all results as an array.
```js
const {forEach} = require('async-iter-tools');

const results = await map(iterable, async (item) => {
    return process(item);
}, {concurrency: 10});
```

#### `toArray(iterable, {concurrency = 1} = {})`
Convert an async iterable to an array.
```js
const {toArray} = require('async-iter-tools');

const arr = await toArray(iterable);
```

#### `chunk(iterable, {chunkSize = 1} = {})`
Convert an async iterable to another async iterable of chunkSize.
```js
const {chunk} = require('async-iter-tools');

const chunkedIterator = chunk(iterable, {chunkSize: 10});
for await (const chunks of chunkedIterator) {
    await Promise.all(chunks);
}
```

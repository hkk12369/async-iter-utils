async function onItem(iterable, fn) {
    for await (const item of iterable) {
        fn(item);
    }
}

function forEach(iterable, fn, {
    concurrency = 1,
    stopOnError = true
} = {}) {
    return new Promise((resolve, reject) => {
        const iterator = iterable[Symbol.asyncIterator]();
        let running = 0;
        let currentIndex = 0;
        let isDone = false;
        const errors = [];
    
        const next = async () => {
            if (isDone) return;
            const nextItem = await iterator.next();
            const index = currentIndex++;
    
            if (nextItem.done) {
                isDone = true;
                if (running === 0) {
                    if (!stopOnError && errors.length > 0) {
                        reject(new AggregateError(errors, `${errors.length} errors`));
                    }
                    else {
                        resolve();
                    }
                }
                return;
            }
    
            running++;
            (async () => {
                try {
                    await fn(await nextItem.value, index);
                    running--;
                    next();
                }
                catch (error) {
                    if (stopOnError) {
                        isDone = true;
                        reject(error);
                    } 
                    else {
                        errors.push(error);
                        running--;
                        next();
                    }
                }
            })();
        };
    
        for (let index = 0; index < concurrency; index++) {
            next();
            if (isDone) {
                break;
            }
        }
    });
}

async function map(iterable, fn, opts) {
    const results = [];
    await forEach(iterable, async (item, index) => {
        results[index] = await fn(item);
    }, opts);
    return results;
}

async function toArray(iterable, {concurrency = 1} = {}) {
    return map(iterable, i => i, {concurrency});
}

async function* chunk(iterable, {chunkSize = 1} = {}) {
    const iterator = iterable[Symbol.asyncIterator](); 
    let items = [];
    let values = [];
    main: while (true) {
        if (items.length >= chunkSize) {
            for (const item of await Promise.all(items)) {
                if (item.done) break main;
                values.push(item.value);
            }
            items = [];
            values = [];
            yield values;
        }
        items.push(iterator.next());
    }
    if (values.length) {
        yield values;
    }
}

module.exports = {
    onItem,
    forEach,
    map,
    toArray,
    chunk,
};

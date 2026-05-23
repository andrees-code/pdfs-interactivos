const installReadableStreamAsyncIterator = () => {
  if (typeof ReadableStream === 'undefined') return;

  const proto = ReadableStream.prototype as ReadableStream<any> & {
    [Symbol.asyncIterator]?: () => AsyncIterator<any>;
  };

  if (typeof proto[Symbol.asyncIterator] === 'function') return;

  Object.defineProperty(proto, Symbol.asyncIterator, {
    configurable: true,
    writable: true,
    value: async function* readableStreamIterator(this: ReadableStream<any>) {
      const reader = this.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) return;
          yield value;
        }
      } finally {
        reader.releaseLock();
      }
    },
  });
};

installReadableStreamAsyncIterator();

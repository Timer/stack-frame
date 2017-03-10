const stack = `TypeError: window[f] is not a function
    at e (file:///Users/joe/Documents/Development/OSS/stack-frame/index.html:25:18)
    at eval (eval at c (file:///Users/joe/Documents/Development/OSS/stack-frame/index.html:12:9), <anonymous>:1:1)
    at a (file:///Users/joe/Documents/Development/OSS/stack-frame/index.html:8:9)
    at file:///Users/joe/Documents/Development/OSS/stack-frame/index.html:32:7`;

const expected = [
  {
    functionName: 'e',
    fileName: 'file:///Users/joe/Documents/Development/OSS/stack-frame/index.html',
    columnNumber: 18,
    lineNumber: 25,
  },
  {
    functionName: 'eval',
    fileName: 'file:///Users/joe/Documents/Development/OSS/stack-frame/index.html',
    columnNumber: 9,
    lineNumber: 12,
  },
  {
    functionName: 'a',
    fileName: 'file:///Users/joe/Documents/Development/OSS/stack-frame/index.html',
    columnNumber: 9,
    lineNumber: 8,
  },
  {
    fileName: 'file:///Users/joe/Documents/Development/OSS/stack-frame/index.html',
    columnNumber: 7,
    lineNumber: 32,
  },
];

module.exports = {
  stack,
  expected,
};

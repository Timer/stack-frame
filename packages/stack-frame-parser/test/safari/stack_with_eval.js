const stack = `e@file:///Users/joe/Documents/Development/OSS/stack-frame/index.html:25:18
eval code
eval@[native code]
a@file:///Users/joe/Documents/Development/OSS/stack-frame/index.html:8:10
global code@file:///Users/joe/Documents/Development/OSS/stack-frame/index.html:32:8`;

const expected = [
  {
    functionName: 'e',
    fileName: 'file:///Users/joe/Documents/Development/OSS/stack-frame/index.html',
    columnNumber: 18,
    lineNumber: 25,
  },
  {
    functionName: 'a',
    fileName: 'file:///Users/joe/Documents/Development/OSS/stack-frame/index.html',
    columnNumber: 10,
    lineNumber: 8,
  },
  {
    functionName: 'global code',
    fileName: 'file:///Users/joe/Documents/Development/OSS/stack-frame/index.html',
    columnNumber: 8,
    lineNumber: 32,
  },
];

module.exports = {
  stack,
  expected,
};

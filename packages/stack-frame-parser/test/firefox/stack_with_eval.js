const stack = `e@file:///Users/joe/Documents/Development/OSS/stack-frame/index.html:25:9
@file:///Users/joe/Documents/Development/OSS/stack-frame/index.html line 17 > eval:1:1
a@file:///Users/joe/Documents/Development/OSS/stack-frame/index.html:8:9
@file:///Users/joe/Documents/Development/OSS/stack-frame/index.html:32:7
`;

const expected = [
  {
    functionName: 'e',
    fileName: 'file:///Users/joe/Documents/Development/OSS/stack-frame/index.html',
    columnNumber: 9,
    lineNumber: 25,
  },
  {
    functionName: 'eval',
    fileName: 'file:///Users/joe/Documents/Development/OSS/stack-frame/index.html',
    lineNumber: 17,
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

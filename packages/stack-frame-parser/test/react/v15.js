const stack = `Warning: Each child in array should have a unique "key" prop. Check render method of \`FileA\`.
     in div (at FileA.js:9)
     in FileA (at App.js:9)
     in div (at App.js:8)
     in App (at index.js:7)`;

const expected = [
  {
    functionName: 'div',
    fileName: 'FileA.js',
    lineNumber: 9,
  },
  {
    functionName: 'FileA',
    fileName: 'App.js',
    lineNumber: 9,
  },
  {
    functionName: 'div',
    fileName: 'App.js',
    lineNumber: 8,
  },
  {
    functionName: 'App',
    fileName: 'index.js',
    lineNumber: 7,
  },
];

module.exports = {
  stack,
  expected,
};

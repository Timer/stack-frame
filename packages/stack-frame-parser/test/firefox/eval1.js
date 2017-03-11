const stack = `test1@file:///C:/example.html line 7 > eval line 1 > eval:1:1
test2@file:///C:/example.html line 7 > eval:1:1
test3@file:///C:/example.html:7:6`;

const expected = [
  {
    fileName: 'file:///C:/example.html',
    functionName: 'test1',
    lineNumber: 7,
  },
  {
    fileName: 'file:///C:/example.html',
    functionName: 'test2',
    lineNumber: 7,
  },
  {
    functionName: 'test3',
    fileName: 'file:///C:/example.html',
    lineNumber: 7,
    columnNumber: 6,
  },
];

module.exports = {
  stack,
  expected,
};

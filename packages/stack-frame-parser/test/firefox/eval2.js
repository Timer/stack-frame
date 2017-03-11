const stack = `anonymous@file:///C:/example.html line 7 > Function:1:1
@file:///C:/example.html:7:6`;

const expected = [
  {
    fileName: 'file:///C:/example.html',
    functionName: 'anonymous',
    lineNumber: 7,
  },
  {
    fileName: 'file:///C:/example.html',
    lineNumber: 7,
    columnNumber: 6,
  },
];

module.exports = {
  stack,
  expected,
};

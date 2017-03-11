const stack = `trace@file:///C:/example.html:9:17
b@file:///C:/example.html:16:13
a@file:///C:/example.html:19:13
@file:///C:/example.html:21:9`;

const expected = [
  {
    functionName: 'trace',
    lineNumber: 9,
    columnNumber: 17,
    fileName: 'file:///C:/example.html',
  },
  {
    functionName: 'b',
    lineNumber: 16,
    columnNumber: 13,
    fileName: 'file:///C:/example.html',
  },
  {
    functionName: 'a',
    lineNumber: 19,
    columnNumber: 13,
    fileName: 'file:///C:/example.html',
  },
  {
    lineNumber: 21,
    columnNumber: 9,
    fileName: 'file:///C:/example.html',
  },
];

module.exports = {
  stack,
  expected,
};

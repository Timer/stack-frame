const stack = `trace@file:///C:/example.html:9
b@file:///C:/example.html:16
a@file:///C:/example.html:19
@file:///C:/example.html:21`;

const expected = [
  {
    functionName: 'trace',
    lineNumber: 9,
    fileName: 'file:///C:/example.html',
  },
  {
    functionName: 'b',
    lineNumber: 16,
    fileName: 'file:///C:/example.html',
  },
  {
    functionName: 'a',
    lineNumber: 19,
    fileName: 'file:///C:/example.html',
  },
  {
    lineNumber: 21,
    fileName: 'file:///C:/example.html',
  },
];

module.exports = {
  stack,
  expected,
};

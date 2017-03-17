import { getLinesAround } from '../';

const arr = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];

const ex = [
  { content: 'two', highlight: false, lineNumber: 2 },
  { content: 'three', highlight: false, lineNumber: 3 },
  { content: 'four', highlight: true, lineNumber: 4 },
  { content: 'five', highlight: false, lineNumber: 5 },
  { content: 'six', highlight: false, lineNumber: 6 },
];

test('should return lines around from a string', () => {
  expect(getLinesAround(4, 2, arr)).toEqual(ex);
});

test('should return lines around from an array', () => {
  expect(getLinesAround(4, 2, arr.join('\n'))).toEqual(ex);
});

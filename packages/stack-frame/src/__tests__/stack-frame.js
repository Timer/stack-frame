import { StackFrame } from '../';

test('proper empty shape', () => {
  const empty = new StackFrame();
  expect(empty).toEqual({
    functionName: null,
    fileName: null,
    lineNumber: null,
    columnNumber: null,

    _originalFunctionName: null,
    _originalFileName: null,
    _originalLineNumber: null,
    _originalColumnNumber: null,

    _scriptCode: null,
    _originalScriptCode: null,
  });

  expect(empty.getFunctionName()).toBe(null);
  expect(empty.getSource()).toBe('');
  expect(empty.toString()).toBe('');
});

test('proper full shape', () => {
  const empty = new StackFrame(
    'a',
    'b.js',
    13,
    37,
    undefined,
    'apple',
    'test.js',
    37,
    13
  );
  expect(empty).toEqual({
    functionName: 'a',
    fileName: 'b.js',
    lineNumber: 13,
    columnNumber: 37,

    _originalFunctionName: 'apple',
    _originalFileName: 'test.js',
    _originalLineNumber: 37,
    _originalColumnNumber: 13,

    _scriptCode: null,
    _originalScriptCode: null,
  });

  expect(empty.getFunctionName()).toBe('a');
  expect(empty.getSource()).toBe('b.js:13:37');
  expect(empty.toString()).toBe('a (b.js:13:37)');
});

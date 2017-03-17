import { ScriptLine } from '../';

test('script line shape', () => {
  expect(new ScriptLine(5, 'foobar', true)).toEqual({
    lineNumber: 5,
    content: 'foobar',
    highlight: true,
  });
});

test('script line to provide default highlight', () => {
  expect(new ScriptLine(5, 'foobar')).toEqual({
    lineNumber: 5,
    content: 'foobar',
    highlight: false,
  });
});

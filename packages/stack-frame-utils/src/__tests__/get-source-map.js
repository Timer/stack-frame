import { getSourceMap } from '../';
import fs from 'fs';
import { resolve } from 'path';

test('finds an external source map', async () => {
  const file = fs
    .readFileSync(resolve(__dirname, '../../fixtures/bundle.js'))
    .toString('utf8');
  fetch.mockResponseOnce(
    fs
      .readFileSync(resolve(__dirname, '../../fixtures/bundle.js.map'))
      .toString('utf8')
  );

  const sm = await getSourceMap('/', file);
  expect(sm.getOriginalPosition(26122, 21)).toEqual({
    line: 7,
    column: 0,
    source: 'webpack:///packages/react-scripts/template/src/App.js',
  });
});

test('find an inline source map', async () => {
  const sourceName = 'test.js';

  const file = fs
    .readFileSync(resolve(__dirname, '../../fixtures/inline.js'))
    .toString('utf8');
  const fileO = fs
    .readFileSync(resolve(__dirname, '../../fixtures/inline.es6.js'))
    .toString('utf8');

  const sm = await getSourceMap('/', file);
  expect(sm.getSources()).toEqual([sourceName]);
  expect(sm.getSource(sourceName)).toBe(fileO);
  expect(sm.getGeneratedPosition(sourceName, 5, 10)).toEqual({
    line: 10,
    column: 8,
  });
});

test('error on a source map with unsupported encoding', async () => {
  expect.assertions(2);

  const file = fs
    .readFileSync(resolve(__dirname, '../../fixtures/junk-inline.js'))
    .toString('utf8');
  try {
    await getSourceMap('/', file);
  } catch (e) {
    expect(e instanceof Error).toBe(true);
    expect(e.message).toBe(
      'Sorry, non-base64 inline source-map encoding is not supported.'
    );
  }
});

import { getSourceMap } from '../';
import fs from 'fs';
import { resolve } from 'path';

test('finds a source map', async () => {
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

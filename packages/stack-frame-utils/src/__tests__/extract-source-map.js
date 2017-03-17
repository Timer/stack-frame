import { extractSourceMapUrl } from '../getSourceMap';

test('extracts proper source map directive', async () => {
  const res = await extractSourceMapUrl(
    `test.js`,
    `//# sourceMappingURL=test.js.map\nconsole.log('a')\n//# sourceMappingURL=bundle.js.map`
  );
  expect(res).toBe('bundle.js.map');
});

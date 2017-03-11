//@flow
import { SourceMapConsumer } from 'source-map';

async function getSourceMap(
  fileUri: string,
  fileContents: string
): Promise<SourceMapConsumer> {
  const match = /\/\/[#@] ?sourceMappingURL=([^\s'"]+)\s*$/m.exec(fileContents);
  if (!(match && match[1]))
    throw new Error(`Source map not found for file: ${fileUri}`);

  let sm = match[1].toString();
  if (sm.indexOf('data:') === 0) {
    const base64 = /^data:application\/json;([\w=:"-]+;)*base64,/;
    const match2 = sm.match(base64);
    if (!match2) {
      throw new Error(
        'Sorry, non-base64 inline source-map encoding is not supported.'
      );
    }
    sm = sm.substring(match2[0].length);
    sm = window.atob(sm);
    sm = JSON.parse(sm);
    return new SourceMapConsumer(sm);
  } else {
    const index = fileUri.lastIndexOf('/');
    const url = fileUri.substring(0, index + 1) + sm;
    const obj = await fetch(url).then(res => res.json());
    return new SourceMapConsumer(obj);
  }
}

export { getSourceMap };
export default getSourceMap;

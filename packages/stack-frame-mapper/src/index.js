//@flow
import StackFrame from 'stack-frame';
import { getSourceMap, getLinesAround } from 'stack-frame-utils';

async function map(frames: StackFrame[]): Promise<StackFrame[]> {
  const cache = {};
  return await Promise.all(
    frames.map(async frame => {
      const { functionName, fileName, lineNumber, columnNumber } = frame;
      let { map, fileSource } = cache[fileName];
      if (map == null) {
        fileSource = await fetch(fileName).then(r => r.text());
        map = await getSourceMap(fileName, fileSource);
        cache[fileName] = { map, fileSource };
      }
      const { source, line, column } = map.originalPositionFor({
        line: lineNumber,
        column: columnNumber,
      });
      const originalSource = map.sourceContentFor(source);
      return new StackFrame(
        functionName,
        fileName,
        lineNumber,
        columnNumber,
        getLinesAround(lineNumber, 3, fileSource),
        functionName,
        source,
        line,
        column,
        getLinesAround(line, 3, originalSource)
      );
    })
  );
}

export { map };
export default map;

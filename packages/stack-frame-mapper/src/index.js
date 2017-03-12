//@flow
import StackFrame from 'stack-frame';
import getSourceMap from 'stack-frame-utils/lib/getSourceMap';

async function map(frames: StackFrame[]): Promise<StackFrame[]> {
  const cache = {};
  return await Promise.all(
    frames.map(async frame => {
      const { functionName, fileName, lineNumber, columnNumber } = frame;
      let map = cache[fileName];
      if (map == null) {
        map[fileName] = await getSourceMap(
          fileName,
          await fetch(fileName).then(r => r.text())
        );
      }
      const { source, line, column } = map.originalPositionFor({
        line: lineNumber,
        column: columnNumber,
      });
      return new StackFrame(
        functionName,
        fileName,
        lineNumber,
        columnNumber,
        undefined,
        functionName,
        source,
        line,
        column,
        undefined
      );
    })
  );
}

export { map };
export default map;

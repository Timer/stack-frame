//@flow
import StackFrame from 'stack-frame';
import getSourceMap from 'stack-frame-utils/lib/getSourceMap';

async function map(
  frames: StackFrame[],
  fileUri: string,
  fileContents: ?string
): Promise<StackFrame[]> {
  if (fileContents == null) {
    fileContents = await fetch(fileUri).then(res => res.text());
  }
  const map = await getSourceMap(fileUri, fileContents);
  return frames.map(frame => {
    const { functionName, fileName, lineNumber, columnNumber } = frame;
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
  });
}

export { map };
export default map;

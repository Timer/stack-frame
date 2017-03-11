//@flow
import StackFrame from 'stack-frame';
import getSourceMap from 'stack-frame-utils/lib/getSourceMap';

async function unmap(
  frames: StackFrame[],
  fileUri: string,
  fileContents: ?string
): Promise<StackFrame[]> {
  const map = await getSourceMap(fileUri, fileContents);
  return frames.map(frame => {
    const { functionName, fileName, lineNumber, columnNumber } = frame;
    const { line, column } = map.generatedPositionFor({
      source: fileName,
      line: lineNumber,
      column: columnNumber,
    });
    return new StackFrame(
      functionName,
      fileUri,
      line,
      column,
      undefined,
      functionName,
      fileName,
      lineNumber,
      columnNumber,
      undefined
    );
  });
}

export { unmap };
export default unmap;

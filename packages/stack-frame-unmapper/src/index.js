//@flow
import StackFrame from 'stack-frame';
import getSourceMap from 'stack-frame-utils/lib/getSourceMap';
import path from 'path';

async function unmap(
  frames: StackFrame[],
  fileUri: string,
  fileContents: ?string
): Promise<StackFrame[]> {
  if (fileContents == null) {
    fileContents = await fetch(fileUri).then(res => res.text());
  }
  const map = await getSourceMap(fileUri, fileContents);
  return frames.map(frame => {
    const {
      functionName,
      lineNumber,
      columnNumber,
      _originalLineNumber,
    } = frame;
    if (_originalLineNumber != null) {
      return frame;
    }
    let { fileName } = frame;
    if (fileName) fileName = path.resolve(fileName);
    const source = map.sources
      .map(s => s.replace(/[\\]+/g, '/'))
      .filter(s => {
        s = path.resolve(s);
        return s.indexOf(fileName) === s.length - fileName.length;
      })
      .map(s => s.split(path.sep))
      .sort((a, b) => Math.sign(a.length - b.length))
      .map(s => s.join(path.sep))
      .map(s => s.split('node_modules'))
      .sort((a, b) => Math.sign(a.length - b.length))
      .map(s => s.join('node_modules'));
    if (source.length < 1) return null;
    const { line, column } = map.generatedPositionFor({
      source: source[0],
      line: lineNumber,
      column: columnNumber,
    });
    return new StackFrame(
      functionName,
      fileUri,
      line,
      column || null,
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

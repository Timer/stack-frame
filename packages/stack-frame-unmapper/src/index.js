//@flow
import StackFrame from 'stack-frame';
import { getSourceMap, getLinesAround } from 'stack-frame-utils';
import path from 'path';

/**
 * Turns a set of mapped <code>{@link https://github.com/Timer/stack-frame/tree/master/packages/stack-frame#stackframe StackFrame}</code>s back into their generated code position and enhances them with code.
 * @param {StackFrame[]} frames A set of <code>{@link https://github.com/Timer/stack-frame/tree/master/packages/stack-frame#stackframe StackFrame}</code>s which are already mapped and missing their generated positions.
 * @param {string} fileUri The URI of the <code>bundle.js</code> file.
 * @param {?string} fileContents Optional. The contents of the file. Providing this prevents an extra fetch.
 */
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
    const source = map
      .getSources()
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
    const { line, column } = map.getGeneratedPosition(
      source[0],
      lineNumber,
      columnNumber
    );
    const originalSource = map.getSource(source[0]);
    return new StackFrame(
      functionName,
      fileUri,
      line,
      column || null,
      getLinesAround(line, 3, fileContents),
      functionName,
      fileName,
      lineNumber,
      columnNumber,
      getLinesAround(lineNumber, 3, originalSource)
    );
  });
}

export { unmap };
export default unmap;

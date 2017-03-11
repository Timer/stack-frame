//@flow
import StackFrame, { ScriptLine } from 'stack-frame';
import { parse as parseError } from 'stack-frame-parser';
import settlePromises from 'settle-promise';
import getSourceMap from 'stack-frame-utils/lib/getSourceMap';

function getLinesAround(
  line: number,
  count: number,
  lines: string[] = []
): ScriptLine[] {
  if (typeof lines === 'string') {
    lines = lines.split('\n');
  }
  const result = [];
  for (
    let index = Math.max(0, line - 1 - count);
    index <= Math.min(lines.length - 1, line - 1 + count);
    ++index
  ) {
    result.push(new ScriptLine(index + 1, lines[index], index === line - 1));
  }
  return result;
}

async function resolve(
  error: Error,
  context: number = 3
): Promise<StackFrame[]> {
  const frames = parseError(error);

  const files = {};
  for (const frame of frames) {
    const { fileName } = frame;
    if (fileName == null || typeof fileName !== 'string') continue;
    files[fileName] = null;
  }

  const fileList = Object.keys(files);
  let requests = [];
  for (const file of fileList) {
    try {
      requests.push(
        fetch(file)
          .then(res => res.text())
          .then(text => {
            files[file] = text;
          })
          .catch(e => {})
      );
    } catch (e) {}
  }

  await settlePromises(requests);

  const sourcemaps = {};
  requests = [];
  for (const file of fileList) {
    requests.push(
      getSourceMap(file, files[file])
        .then(map => {
          sourcemaps[file] = map;
        })
        .catch(e => {})
    );
  }

  await settlePromises(requests);

  const resolved = [];
  for (let index = 0; index < frames.length; ++index) {
    const {
      [index]: {
        functionName,
        fileName,
        lineNumber: line,
        columnNumber: column,
      },
    } = frames;
    resolved[index] = new StackFrame(functionName, fileName, line, column);
    if (fileName == null || line == null || column == null) continue;

    if (!files.hasOwnProperty(fileName)) continue;
    const script = files[fileName];
    if (script == null) continue;
    const oScriptArr = getLinesAround(line, context, script);
    resolved[index] = new StackFrame(
      functionName,
      fileName,
      line,
      column,
      oScriptArr
    );

    if (!sourcemaps.hasOwnProperty(fileName)) continue;
    const { [fileName]: map } = sourcemaps;
    if (map == null) continue;
    const original = map.originalPositionFor({ line, column });
    const {
      source: sourceFile,
      line: sourceLine,
      column: sourceColumn,
    } = original;
    if (!sourceFile || !line) continue;
    const originalSource = map.sourceContentFor(sourceFile);
    const oSourceArr = getLinesAround(sourceLine, context, originalSource);
    resolved[index] = new StackFrame(
      functionName,
      fileName,
      line,
      column,
      oScriptArr,
      functionName,
      sourceFile,
      sourceLine,
      sourceColumn,
      oSourceArr
    );
  }
  return resolved;
}

export { resolve };
export default resolve;

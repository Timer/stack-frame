//@flow
import StackFrame, { ScriptLine } from 'stack-frame';
import { parse as parseError } from 'stack-frame-parser';
import { SourceMapConsumer } from 'source-map';

async function awaitAll(promises: Promise<*>[]) {
  for (const p of promises) {
    try {
      await p;
    } catch (e) {}
  }
}

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

async function getSourceMap(
  file: string,
  contents: string
): Promise<SourceMapConsumer> {
  const match = /\/\/[#@] ?sourceMappingURL=([^\s'"]+)\s*$/m.exec(contents);
  if (!(match && match[1]))
    throw new Error(`Source map not found for file: ${file}`);

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
    const index = file.lastIndexOf('/');
    const url = file.substring(0, index + 1) + sm;
    const obj = await fetch(url).then(res => res.json());
    return new SourceMapConsumer(obj);
  }
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

  await awaitAll(requests);

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

  await awaitAll(requests);

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

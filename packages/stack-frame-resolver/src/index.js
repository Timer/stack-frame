import ErrorStackParser from 'error-stack-parser'
import { SourceMapConsumer } from 'source-map'

class ResolvedStackFrame {
  constructor(
    functionName = '(anonymous function)',
    fileName = '?', lineNumber = 0, columnNumber = 0,
    scriptLines = [],
    sourceFileName = '', sourceLineNumber = 0, sourceColumnNumber = 0,
    sourceLines = []
  ) {
    this.functionName = functionName
    this.fileName = fileName
    this.lineNumber = lineNumber
    this.columnNumber = columnNumber
    this.scriptLines = scriptLines
    this.sourceFileName = sourceFileName
    this.sourceLineNumber = sourceLineNumber
    this.sourceColumnNumber = sourceColumnNumber
    this.sourceLines = sourceLines
  }
}

async function awaitAll(promises) {
  for (const p of promises) {
    try {
      await p
    } catch (e) { }
  }
}

function getLinesAround(line, count, lines = []) {
  if (typeof lines === 'string') lines = lines.split('\n')
  const result = []
  for (let index = Math.max(0, line - 1 - count); index <= Math.min(lines.length - 1, line - 1 + count); ++index) {
    result.push({
      text: lines[index],
      line: index + 1,
      context: index !== line - 1
    })
  }
  return result
}

async function getSourceMap(file, contents) {
  const match = /\/\/[#@] ?sourceMappingURL=([^\s'"]+)\s*$/m.exec(contents)
  if (!(match && match[1])) throw new Error(`Source map not found for file: ${file}`)

  let sm = match[1].toString()
  if (sm.indexOf('data:') === 0) {
    const base64 = /^data:application\/json;([\w=:"-]+;)*base64,/
    const match2 = sm.match(base64)
    if (!match2) {
      throw new Error('Sorry, we do not support this inline source-map encoding.')
    }
    sm = sm.substring(match2[0].length)
    sm = window.atob(sm)
    sm = JSON.parse(sm)
    return new SourceMapConsumer(sm)
  } else {
    const index = file.lastIndexOf('/')
    const url = file.substring(0, index + 1) + sm
    const obj = await fetch(url).then(res => res.json())
    return new SourceMapConsumer(obj)
  }
}

async function resolve(error, context = 3) {
  const frames = ErrorStackParser.parse(error)

  const files = { }
  for (const frame of frames) {
    const { fileName } = frame
    if (fileName == null || (typeof fileName) !== 'string') continue
    files[fileName] = null
  }

  const fileList = Object.keys(files)
  let requests = []
  for (const file of fileList) {
    try {
      requests.push(fetch(file).then(res => res.text()).then(text => {
        files[file] = text
      }).catch(e => { }))
    } catch (e) { }
  }

  await awaitAll(requests)

  const sourcemaps = { }
  requests = []
  for (const file of fileList) {
    requests.push(getSourceMap(file, files[file]).then(map => {
      sourcemaps[file] = map
    }).catch(e => { }))
  }

  await awaitAll(requests)

  const resolved = []
  for (let index = 0; index < frames.length; ++index) {
    const { [index]: { functionName, fileName, lineNumber: line, columnNumber: column } } = frames
    resolved[index] = new ResolvedStackFrame(functionName, fileName, line, column)
    if (fileName == null || line == null || column == null) continue

    if (!files.hasOwnProperty(fileName)) continue
    const script = files[fileName]
    if (script == null) continue
    const oScriptArr = getLinesAround(line, context, script)
    resolved[index] = new ResolvedStackFrame(functionName, fileName, line, column, oScriptArr)

    if (!sourcemaps.hasOwnProperty(fileName)) continue
    const { [fileName]: map } = sourcemaps
    if (map == null) continue
    const original = map.originalPositionFor({ line, column })
    const { source: sourceFile, line: sourceLine, column: sourceColumn } = original
    if (!sourceFile || !line) continue
    const originalSource = map.sourceContentFor(sourceFile)
    const oSourceArr = getLinesAround(sourceLine, context, originalSource)
    resolved[index] = new ResolvedStackFrame(
      functionName,
      fileName, line, column,
      oScriptArr,
      sourceFile, sourceLine, sourceColumn,
      oSourceArr
    )
  }
  return resolved
}

export default resolve

export { resolve, ResolvedStackFrame }

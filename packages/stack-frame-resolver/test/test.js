require('babel-polyfill')
require('whatwg-fetch')

const isPhantom = window.navigator.userAgent.match(/PhantomJS/)
const errorLine = 'const error = new Error(\'Hi\')'
const line = (function() {
  if (isPhantom) {
    return 'if (isPhantom) try { throw error } catch (e) { }'
  }
  return errorLine
})()

const StackTraceResolve = require('../lib')
const resolve = StackTraceResolve.default, ResolvedStackFrame = StackTraceResolve.ResolvedStackFrame
const assert = require('assert')

describe('resolves stack traces', function() {
  it('resolves the source line number', function(done) {
    const error = new Error('Hi')
    if (isPhantom) try { throw error } catch (e) { }
    const frames = resolve(error)
    frames.then(function(result) {
      assert(result[0].sourceLineNumber === isPhantom ? 20 : 19)
      assert(result[0].sourceLines.filter(function(l) { return !l.context })[0].text.trim() === line)
      done()
    }).catch(function(e) {
      done.fail(e)
    })
  })

  it('respects context size', function(done) {
    const error = new Error('Hi')
    if (isPhantom) try { throw error } catch (e) { }
    const frames = resolve(error, 1)
    frames.then(function(result) {
      assert(result[0].sourceLineNumber === isPhantom ? 33 : 32)
      assert(result[0].sourceLines.length === 3)
      assert(result[0].scriptLines.length === 3)
      done()
    }).catch(function(e) {
      done.fail(e)
    })
  })

  it('only returns one non-context line', function(done) {
    const error = new Error('Hi')
    if (isPhantom) try { throw error } catch (e) { }
    const frames = resolve(error, 1)
    frames.then(function(result) {
      assert(result[0].sourceLineNumber === isPhantom ? 47 : 46)
      assert(result[0].sourceLines.filter(function(l) { return !l.context }).length === 1)
      assert(result[0].scriptLines.filter(function(l) { return !l.context }).length === 1)
      done()
    }).catch(function(e) {
      done.fail(e)
    })
  })
})

describe('ResolvedStackFrame', function() {
  it('should have reasonable defaults', function() {
    const frame = new ResolvedStackFrame()
    assert(frame.functionName === '(anonymous function)')
    assert(frame.fileName === '?')
    assert(frame.lineNumber === 0)
    assert(frame.columnNumber === 0)
    assert(Array.isArray(frame.scriptLines) && frame.scriptLines.length === 0)
    assert(frame.sourceFileName === '')
    assert(frame.sourceLineNumber === 0)
    assert(frame.sourceColumnNumber === 0)
    assert(Array.isArray(frame.sourceLines) && frame.sourceLines.length === 0)
  })

  it('must be called with new', function() {
    assert.throws(function() {
      ResolvedStackFrame()
    })
  })
})

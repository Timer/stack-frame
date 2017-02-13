require('babel-polyfill');
require('whatwg-fetch');

const isPhantom = window.navigator.userAgent.match(/PhantomJS/);
const errorLine = "const error = new Error('Hi');";
const line = (function() {
  if (isPhantom) {
    return 'if (isPhantom) try { throw error; } catch (e) { }';
  }
  return errorLine;
})();

const StackTraceResolve = require('../lib');
const resolve = StackTraceResolve.default,
  ResolvedStackFrame = require('stack-frame');
const assert = require('assert');

describe('resolves stack traces', function() {
  it('resolves the source line number', function(done) {
    const error = new Error('Hi');
    // prettier-ignore
    if (isPhantom) try { throw error; } catch (e) { }
    const frames = resolve(error);
    frames
      .then(function(result) {
        assert(result[0]._originalLineNumber === isPhantom ? 22 : 20);
        assert(
          result[0]._scriptCode
            .filter(function(l) {
              return l.highlight;
            })[0]
            .content.trim() === line
        );
        done();
      })
      .catch(function(e) {
        done.fail(e);
      });
  });

  it('respects context size', function(done) {
    const error = new Error('Hi');
    // prettier-ignore
    if (isPhantom) try { throw error; } catch (e) { }
    const frames = resolve(error, 1);
    frames
      .then(function(result) {
        assert(result[0]._originalLineNumber === isPhantom ? 44 : 42);
        assert(result[0]._scriptCode.length === 3);
        assert(result[0]._scriptCode.length === 3);
        done();
      })
      .catch(function(e) {
        done.fail(e);
      });
  });

  it('only returns one non-context line', function(done) {
    const error = new Error('Hi');
    // prettier-ignore
    if (isPhantom) try { throw error; } catch (e) { }
    const frames = resolve(error, 1);
    frames
      .then(function(result) {
        assert(result[0]._originalLineNumber === isPhantom ? 61 : 59);
        assert(
          result[0]._scriptCode.filter(function(l) {
            return l.highlight;
          }).length === 1
        );
        assert(
          result[0]._scriptCode.filter(function(l) {
            return l.highlight;
          }).length === 1
        );
        done();
      })
      .catch(function(e) {
        done.fail(e);
      });
  });
});

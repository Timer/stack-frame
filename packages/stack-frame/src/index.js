//@flow

class ScriptLine {
  lineNumber: number;
  content: string;
  highlight: boolean;

  constructor(lineNumber: number, content: string, highlight: boolean = false) {
    this.lineNumber = lineNumber;
    this.content = content;
    this.highlight = highlight;
  }
}

class StackFrame {
  functionName: string | null;
  fileName: ?string;
  lineNumber: number;
  columnNumber: ?number;

  _originalFunctionName: ?string;
  _originalFileName: ?string;
  _originalLineNumber: ?number;
  _originalColumnNumber: ?number;

  _scriptCode: ?(ScriptLine[]);
  _originalScriptCode: ?(ScriptLine[]);

  constructor(
    functionName: string | null,
    fileName: ?string = null,
    lineNumber: number = -1,
    columnNumber: ?number = undefined,
    scriptCode: ?(ScriptLine[]),
    sourceFunctionName: ?string = null,
    sourceFileName: ?string = null,
    sourceLineNumber: ?number = null,
    sourceColumnNumber: ?number = null,
    sourceScriptCode: ?(ScriptLine[])
  ) {
    this.functionName = functionName;

    this.fileName = fileName;
    this.lineNumber = lineNumber;
    this.columnNumber = columnNumber;

    this._originalFunctionName = sourceFunctionName;
    this._originalFileName = sourceFileName;
    this._originalLineNumber = sourceLineNumber;
    this._originalColumnNumber = sourceColumnNumber;

    this._scriptCode = scriptCode;
    this._originalScriptCode = sourceScriptCode;
  }

  getFunctionName(): string | null {
    return this.functionName;
  }

  getSource(): string {
    let prefix = '';
    if (this.fileName != null) {
      prefix = `${this.fileName}:`;
    }
    let suffix = '';
    if (this.columnNumber != null) {
      suffix = `:${this.columnNumber}`;
    }
    return `${prefix}${this.lineNumber}${suffix}`;
  }

  toString(): string {
    const f = this.getFunctionName();
    if (f == null) return this.getSource();
    return `${f} (${this.getSource()})`;
  }
}

export { ScriptLine };
export default StackFrame;

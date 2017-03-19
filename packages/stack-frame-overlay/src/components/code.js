/* @flow */
import type { ScriptLines } from 'stack-frame';
import { applyStyles } from '../utils/dom/css';
import { absolutifyCaret } from '../utils/dom/absolutifyCaret';
import {
  preStyle,
  codeStyle,
  primaryErrorStyle,
  secondaryErrorStyle,
} from '../styles';

import codeFrame from 'babel-code-frame';
import { generateAnsiHtml } from 'ansi-html-themed';

function createCode(
  document: Document,
  sourceLines: ScriptLines[],
  lineNum: number,
  columnNum: number,
  contextSize: number,
  main: boolean = false
) {
  const sourceCode = [];
  let whiteSpace = Infinity;
  sourceLines.forEach(function(e) {
    const { content: text } = e;
    const m = text.match(/^\s*/);
    if (text === '') {
      return;
    }
    if (m && m[0]) {
      whiteSpace = Math.min(whiteSpace, m[0].length);
    } else {
      whiteSpace = 0;
    }
  });
  sourceLines.forEach(function(e) {
    let { content: text } = e;
    const { lineNumber: line } = e;

    if (isFinite(whiteSpace)) {
      text = text.substring(whiteSpace);
    }
    sourceCode[line - 1] = text;
  });
  const ansiHighlight = codeFrame(
    sourceCode.join('\n'),
    lineNum,
    columnNum - (isFinite(whiteSpace) ? whiteSpace : 0),
    {
      forceColor: true,
      linesAbove: contextSize,
      linesBelow: contextSize,
    }
  );
  const htmlHighlight = generateAnsiHtml(ansiHighlight);
  const code = document.createElement('code');
  code.innerHTML = htmlHighlight;
  absolutifyCaret(code);
  applyStyles(code, codeStyle);

  const ccn = code.childNodes;
  oLoop: for (let index = 0; index < ccn.length; ++index) {
    const node = ccn[index];
    const ccn2 = node.childNodes;
    for (let index2 = 0; index2 < ccn2.length; ++index2) {
      const lineNode = ccn2[index2];
      const text = lineNode.innerText;
      if (text == null) {
        continue;
      }
      if (text.indexOf(' ' + lineNum + ' |') === -1) {
        continue;
      }
      // $FlowFixMe
      applyStyles(node, main ? primaryErrorStyle : secondaryErrorStyle);
      break oLoop;
    }
  }
  const pre = document.createElement('pre');
  applyStyles(pre, preStyle);
  pre.appendChild(code);
  return pre;
}

export { createCode };

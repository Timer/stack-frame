/* @flow */
import Anser from 'anser';

const base01 = 'f5f5f5',
  base03 = '969896',
  base05 = '333333',
  base08 = 'ed6a43',
  base0B = '183691',
  base0C = '183691',
  base0E = 'a71d5d';

const defaultColors = {
  reset: [base05, 'transparent'],
  black: base05,
  red: base08 /* marker, bg-invalid */,
  green: base0B /* string */,
  yellow: base08 /* capitalized, jsx_tag, punctuator */,
  blue: base0C,
  magenta: base0C /* regex */,
  cyan: base0E /* keyword */,
  gray: base03 /* comment, gutter */,
  lightgrey: base01,
  darkgrey: base03,
};

function generateAnsiHtml(text: string, colors: Object = {}) {
  colors = Object.assign({}, defaultColors, colors);
  const arr = new Anser().ansiToJson(text, {
    use_classes: true,
  });

  let result = '';
  let open = false;
  for (let index = 0; index < arr.length; ++index) {
    const c = arr[index];
    const { content, fg } = c;
    const contentParts = content.split('\n');
    for (let _index = 0; _index < contentParts.length; ++_index) {
      if (!open) {
        result += '<span data-ansi-line="true">';
        open = true;
      }
      const part = contentParts[_index].replace('\r', '');
      const color = fg == null
        ? null
        : colors[fg] || colors[fg.replace(/^ansi-(bright-)?/, '')];
      if (color != null) {
        result += '<span style="color: #' + color + ';">' + part + '</span>';
      } else {
        result += '<span>' + part + '</span>';
      }
      if (_index < contentParts.length - 1) {
        result += '</span>';
        open = false;
        result += '<br/>';
      }
    }
  }
  if (open) {
    result += '</span>';
    open = false;
  }
  return result;
}

export { generateAnsiHtml };

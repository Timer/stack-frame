//@flow
import StackFrame from 'stack-frame';

const regexExtractLocation = /\(?(.+?)(?:\:(\d+))?(?:\:(\d+))?\)?$/;

function extractLocation(token: string): [string, number, number] {
  return regexExtractLocation.exec(token).slice(1);
}

const regexValidFrame_Chrome = /^\s*at\s.+(:\d+)/;
const regexValidFrame_FireFox = /(^|@)\S+\:\d+/;

function parseStack(stack: string): StackFrame[] {
  const frames = stack
    .split('\n')
    .filter(
      e => regexValidFrame_Chrome.test(e) || regexValidFrame_FireFox.test(e)
    )
    .map(e => {
      if (regexValidFrame_FireFox.test(e)) {
        const data = e.split(/[@]/g);
        const last = data.pop();
        return new StackFrame(
          data.join('@') || undefined,
          ...extractLocation(last)
        );
      } else {
        const data = e.trim().split(/\s+/g).slice(1);
        const last = data.pop();
        return new StackFrame(
          data.join(' ') || undefined,
          ...extractLocation(last)
        );
      }
    });
  return frames;
}

function parseError(error: Error): StackFrame[] {
  if (error == null || typeof error.stack !== 'string') {
    throw new Error('The error you provided does not contain a stack trace.');
  }
  return parseStack(error.stack);
}

export { parseError as parse };
export default parseError;

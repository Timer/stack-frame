/* @flow */
import type { StackFrame } from 'stack-frame';
import { parse } from 'stack-frame-parser';
import { map } from 'stack-frame-mapper';

type ErrorRecord = {
  error: Error,
  unhandledRejection: boolean,
  contextSize: number,
  enhancedFrames: StackFrame[],
};
type ErrorRecordReference = number;
const recorded: ErrorRecord[] = [];

let errorsConsumed: ErrorRecordReference = 0;

async function consume(
  error: Error,
  unhandledRejection: boolean = false,
  contextSize: number = 3
): Promise<ErrorRecordReference> {
  const parsedFrames = parse(error);
  let enhancedFrames = await map(parsedFrames, contextSize);
  enhancedFrames = enhancedFrames.filter(
    ({ functionName }) =>
      functionName == null ||
      functionName.indexOf('__stack_frame_overlay_proxy_console__') === -1
  );
  recorded[++errorsConsumed] = {
    error,
    unhandledRejection,
    contextSize,
    enhancedFrames,
  };
  return errorsConsumed;
}

function getErrorRecord(ref: ErrorRecordReference): ErrorRecord {
  return recorded[ref];
}

function drain() {
  // $FlowFixMe
  const keys = Object.keys(recorded);
  for (let index = 0; index < keys.length; ++index) {
    delete recorded[keys[index]];
  }
}

export { consume, getErrorRecord, drain };
export type { ErrorRecordReference };

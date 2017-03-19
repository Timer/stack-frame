/* @flow */
let boundHandler = null;

type ErrorCallback = (error: Error) => void;

function handler(callback: ErrorCallback, e: Event): void {
  if (!e.error) return;
  // $FlowFixMe
  const { error } = e;
  if (error instanceof Error) {
    callback(error);
  } else {
    // A non-error was thrown, we don't have a trace. :(
    // Look in your browser's devtools for more information
    callback(new Error(error));
  }
}

function register(target: EventTarget, callback: ErrorCallback) {
  if (boundHandler !== null) return;
  boundHandler = handler.bind(undefined, callback);
  target.addEventListener('error', boundHandler);
}

function unregister(target: EventTarget) {
  if (boundHandler === null) return;
  target.removeEventListener('error', boundHandler);
  boundHandler = null;
}

export { register, unregister };

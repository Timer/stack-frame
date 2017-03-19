/* @flow */
let boundHandler = null;

type ErrorCallback = (error: Error) => void;

function handler(callback: ErrorCallback, e: PromiseRejectionEvent): void {
  if (e == null || e.reason == null) {
    return callback(new Error('Unknown'));
  }
  let { reason } = e;
  if (reason instanceof Error) {
    return callback(reason);
  }
  return callback(new Error(reason));
}

function register(target: EventTarget, callback: ErrorCallback) {
  if (boundHandler !== null) return;
  boundHandler = handler.bind(undefined, callback);
  // $FlowFixMe
  target.addEventListener('unhandledrejection', boundHandler);
}

function unregister(target: EventTarget) {
  if (boundHandler === null) return;
  // $FlowFixMe
  target.removeEventListener('unhandledrejection', boundHandler);
  boundHandler = null;
}

export { register, unregister };

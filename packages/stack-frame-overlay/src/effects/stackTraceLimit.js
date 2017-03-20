/* @flow */
let registered: boolean = false;
// Default: https://docs.microsoft.com/en-us/scripting/javascript/reference/stacktracelimit-property-error-javascript
let restoreValue: number = 10;

const MAX_STACK_LENGTH: number = 50;

function register(limit: number = MAX_STACK_LENGTH) {
  if (registered) return;
  try {
    restoreValue = Error.stackTraceLimit;
    Error.stackTraceLimit = limit;
    registered = true;
  } catch (e) {
    // Not all browsers support this so we don't care if it errors
  }
}

function unregister() {
  if (!registered) return;
  try {
    Error.stackTraceLimit = restoreValue;
    registered = false;
  } catch (e) {
    // Not all browsers support this so we don't care if it errors
  }
}

export { register, unregister };

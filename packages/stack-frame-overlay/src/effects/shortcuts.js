/* @flow */
const SHORTCUT_ESCAPE = 'SHORTCUT_ESCAPE',
  SHORTCUT_LEFT = 'SHORTCUT_LEFT',
  SHORTCUT_RIGHT = 'SHORTCUT_RIGHT';

let boundHandler = null;

function handler(callback, e: KeyboardEvent) {
  const { key, keyCode, which } = e;
  if (key === 'Escape' || keyCode === 27 || which === 27) {
    callback(SHORTCUT_ESCAPE);
  } else if (key === 'ArrowLeft' || keyCode === 37 || which === 37) {
    callback(SHORTCUT_LEFT);
  } else if (key === 'ArrowRight' || keyCode === 39 || which === 39) {
    callback(SHORTCUT_RIGHT);
  }
}

type ShortcutCallback = (type: string) => void;
function register(target: EventTarget, callback: ShortcutCallback) {
  if (boundHandler !== null) return;
  boundHandler = handler.bind(undefined, callback);
  target.addEventListener('keydown', boundHandler);
}

function unregister(target: EventTarget) {
  if (boundHandler === null) return;
  target.removeEventListener('keydown', boundHandler);
  boundHandler = null;
}

export { SHORTCUT_ESCAPE, SHORTCUT_LEFT, SHORTCUT_RIGHT, register, unregister };

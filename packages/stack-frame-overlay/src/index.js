/* @flow */
import { injectCss, removeCss, applyStyles } from './utils/dom/css';
import StackFrameParser from 'stack-frame-parser';
import StackFrameMapper from 'stack-frame-mapper';
import type { FrameSetting } from './components/frames';
import { consumeEvent } from './utils/dom/consumeEvent';
import { enableTabClick } from './utils/dom/enableTabClick';
import { createClose } from './components/close';
import { createFrames } from './components/frames';
import { createFooter } from './components/footer';
import {
  register as registerPromise,
  unregister as unregisterPromise,
} from './effects/unhandledRejection';
import {
  register as registerShortcuts,
  unregister as unregisterShortcuts,
  SHORTCUT_ESCAPE,
  SHORTCUT_LEFT,
  SHORTCUT_RIGHT,
} from './effects/shortcuts';
import { register as registerStackTraceLimit } from './effects/stackTraceLimit';

const CONTEXT_SIZE = 3;

const css = [
  '.cra-container {',
  '  padding-right: 15px;',
  '  padding-left: 15px;',
  '  margin-right: auto;',
  '  margin-left: auto;',
  '}',
  '',
  '@media (min-width: 768px) {',
  '  .cra-container {',
  '    width: calc(750px - 6em);',
  '  }',
  '}',
  '',
  '@media (min-width: 992px) {',
  '  .cra-container {',
  '    width: calc(970px - 6em);',
  '  }',
  '}',
  '',
  '@media (min-width: 1200px) {',
  '  .cra-container {',
  '    width: calc(1170px - 6em);',
  '  }',
  '}',
].join('\n');

import {
  groupStyle,
  groupElemLeft,
  groupElemRight,
  overlayStyle,
  additionalStyle,
  headerStyle,
} from './styles';

let overlayReference = null;
let additionalReference = null;
let capturedErrors: {
  error: Error,
  unhandledRejection: boolean,
  resolvedFrames: Object[],
}[] = [];
let viewIndex = -1;
let injects = [];
let frameSettings: FrameSetting[] = [];

function renderAdditional() {
  if (additionalReference == null)
    throw new Error('Additional reference must be set!');
  if (additionalReference.lastChild) {
    additionalReference.removeChild(additionalReference.lastChild);
  }

  let text = ' ';
  if (capturedErrors.length <= 1) {
    additionalReference.appendChild(document.createTextNode(text));
    return;
  }
  text = 'Errors ' + (viewIndex + 1) + ' of ' + capturedErrors.length;
  const span = document.createElement('span');
  span.appendChild(document.createTextNode(text));
  const group = document.createElement('span');
  applyStyles(group, groupStyle);
  const left = document.createElement('button');
  applyStyles(left, groupElemLeft);
  left.addEventListener('click', function(e: MouseEvent) {
    consumeEvent(e);
    switchError(-1);
  });
  left.appendChild(document.createTextNode('←'));
  enableTabClick(left);
  const right = document.createElement('button');
  applyStyles(right, groupElemRight);
  right.addEventListener('click', function(e: MouseEvent) {
    consumeEvent(e);
    switchError(1);
  });
  right.appendChild(document.createTextNode('→'));
  enableTabClick(right);
  group.appendChild(left);
  group.appendChild(right);
  span.appendChild(group);
  additionalReference.appendChild(span);
}

function render(error, name, message, resolvedFrames) {
  dispose();

  frameSettings = resolvedFrames.map(function() {
    return { compiled: false };
  });

  injects.push(injectCss(document, css));

  // Create overlay
  const overlay = document.createElement('div');
  applyStyles(overlay, overlayStyle);
  overlay.appendChild(
    createClose(window.document, () => {
      unmount();
    })
  );

  // Create container
  const container = document.createElement('div');
  container.className = 'cra-container';
  overlay.appendChild(container);

  // Create additional
  additionalReference = document.createElement('div');
  applyStyles(additionalReference, additionalStyle);
  container.appendChild(additionalReference);
  renderAdditional();

  // Create header
  const header = document.createElement('div');
  applyStyles(header, headerStyle);
  if (message.match(/^\w*:/)) {
    header.appendChild(document.createTextNode(message));
  } else {
    header.appendChild(document.createTextNode(name + ': ' + message));
  }
  container.appendChild(header);

  // Create trace
  container.appendChild(
    createFrames(window.document, resolvedFrames, frameSettings, CONTEXT_SIZE)
  );

  // Show message
  container.appendChild(createFooter(window.document));

  // Mount
  if (document.body !== null) {
    document.body.appendChild((overlayReference = overlay));
  }
}

function dispose() {
  if (overlayReference === null) return;
  if (document.body !== null) {
    document.body.removeChild(overlayReference);
  }
  overlayReference = null;
  injects.forEach(ref => {
    removeCss(document, ref);
  });
  injects = [];
}

function unmount() {
  dispose();
  capturedErrors = [];
  viewIndex = -1;
}

function renderError(index) {
  viewIndex = index;
  const {
    [index]: {
      error,
      unhandledRejection,
      resolvedFrames,
    },
  } = capturedErrors;

  if (unhandledRejection) {
    render(
      error,
      'Unhandled Rejection (' + error.name + ')',
      error.message,
      resolvedFrames
    );
  } else {
    render(error, error.name, error.message, resolvedFrames);
  }
}

function crash(error: Error, unhandledRejection = false) {
  if (module.hot && typeof module.hot.decline === 'function') {
    module.hot.decline();
  }

  const parsedFrames = StackFrameParser(error);
  const mapperPromise = StackFrameMapper(parsedFrames, CONTEXT_SIZE);
  mapperPromise
    .then(function(resolvedFrames) {
      resolvedFrames = resolvedFrames.filter(function({ functionName }) {
        return functionName == null ||
          functionName.indexOf('__stack_frame_overlay_proxy_console__') === -1;
      });
      capturedErrors.push({
        error: error,
        unhandledRejection: unhandledRejection,
        resolvedFrames: resolvedFrames,
      });
      if (overlayReference !== null) {
        renderAdditional();
      } else {
        renderError((viewIndex = 0));
      }
    })
    .catch(function(e) {
      // This is another fail case (unlikely to happen)
      // e.g. render(...) throws an error with provided arguments
      console.log('Red box renderer error:', e);
      unmount();
      render(
        null,
        'Error',
        'There is an error with red box. *Please* report this (see console).',
        []
      );
    });
}

function switchError(offset) {
  try {
    const nextView = viewIndex + offset;
    if (nextView < 0 || nextView >= capturedErrors.length) return;
    renderError(nextView);
  } catch (e) {
    console.log('Red box renderer error:', e);
    unmount();
    render(
      null,
      'Error',
      'There is an error with red box. *Please* report this (see console).',
      []
    );
  }
}

window.onerror = function(messageOrEvent, source, lineno, colno, error) {
  if (
    error == null ||
    !(error instanceof Error) ||
    messageOrEvent.indexOf('Script error') !== -1
  ) {
    crash(new Error(error || messageOrEvent)); // TODO: more helpful message
  } else {
    crash(error);
  }
};

registerPromise(window, error => crash(error, true));

registerShortcuts(window, type => {
  switch (type) {
    case SHORTCUT_ESCAPE: {
      unmount();
      break;
    }
    case SHORTCUT_LEFT: {
      switchError(-1);
      break;
    }
    case SHORTCUT_RIGHT: {
      switchError(1);
      break;
    }
  }
});

registerStackTraceLimit();

const proxyConsole = function proxyConsole(type) {
  const orig = console[type];
  // $FlowFixMe
  console[type] = function __stack_frame_overlay_proxy_console__() {
    const warning = [].slice.call(arguments).join(' ');
    const nIndex = warning.indexOf('\n');
    let message = warning;
    if (nIndex !== -1) {
      message = message.substring(0, nIndex);
    }
    const stack = warning.substring(nIndex + 1);
    window.requestAnimationFrame(function() {
      return crash(
        // $FlowFixMe
        {
          message: message,
          stack: stack,
          __unmap_source: '/static/js/bundle.js',
        },
        false
      );
    });
    return orig.apply(this, arguments);
  };
};

proxyConsole('error');

if (module.hot && typeof module.hot.dispose === 'function') {
  module.hot.dispose(function() {
    unmount();
    unregisterPromise(window);
    unregisterShortcuts(window);
  });
}

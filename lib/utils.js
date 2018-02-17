"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Create custom DOM event the old fashioned way
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/Event/initEvent
 * Although officially deprecated, some browsers (phantom) don't accept the preferred "new Event(eventName)"
 */
function newEvent(eventName, bubbles, cancelable) {
    if (bubbles === void 0) { bubbles = false; }
    if (cancelable === void 0) { cancelable = false; }
    var evt = document.createEvent('CustomEvent'); // MUST be 'CustomEvent'
    evt.initCustomEvent(eventName, bubbles, cancelable, null);
    return evt;
}
exports.newEvent = newEvent;
/** Button events to pass to `DebugElement.triggerEventHandler` for RouterLink event handler */
exports.ButtonClickEvents = {
    left: { button: 0 },
    right: { button: 2 }
};

/**
 * Create custom DOM event the old fashioned way
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/Event/initEvent
 * Although officially deprecated, some browsers (phantom) don't accept the preferred "new Event(eventName)"
 */
export declare function newEvent(eventName: string, bubbles?: boolean, cancelable?: boolean): CustomEvent;
/** Button events to pass to `DebugElement.triggerEventHandler` for RouterLink event handler */
export declare const ButtonClickEvents: {
    left: {
        button: number;
    };
    right: {
        button: number;
    };
};

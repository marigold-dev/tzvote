const cbs = [(_) => undefined];
/**
 * A mock for postmessage if run in node.js environment
 */
let windowRef = {
    postMessage: (message, _target) => {
        console.log('GOT MOCK POST MESSAGE', message);
        cbs.forEach((callbackElement) => {
            callbackElement({ data: message });
        });
    },
    addEventListener: (_name, eventCallback) => {
        cbs.push(eventCallback);
    },
    removeEventListener: (_name, eventCallback) => {
        cbs.splice(cbs.indexOf((element) => element === eventCallback), 1);
    },
    location: {
        origin: '*'
    }
};
try {
    if (typeof window !== 'undefined') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        windowRef = window;
    }
}
catch (windowError) {
    console.log(`not defined: ${windowError}`);
}
const clearMockWindowState = () => {
    cbs.length = 0;
};
export { windowRef, clearMockWindowState };
//# sourceMappingURL=MockWindow.js.map
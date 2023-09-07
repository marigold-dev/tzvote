import { windowRef } from './MockWindow';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let debug = windowRef.beaconSdkDebugEnabled ? true : false;
if (debug) {
    // eslint-disable-next-line no-console
    console.log('[BEACON]: Debug mode is ON (turned on either by the developer or a browser extension)');
}
export const setDebugEnabled = (enabled) => {
    debug = enabled;
};
export const getDebugEnabled = () => debug;
//# sourceMappingURL=debug.js.map
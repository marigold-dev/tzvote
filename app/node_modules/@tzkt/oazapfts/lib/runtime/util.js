"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinUrl = exports.stripUndefined = exports.delimited = exports.encode = exports.allowReserved = exports.encodeReserved = void 0;
// Encode param names and values as URIComponent
exports.encodeReserved = [encodeURIComponent, encodeURIComponent];
exports.allowReserved = [encodeURIComponent, encodeURI];
/**
 * Creates a tag-function to encode template strings with the given encoders.
 */
function encode(encoders, delimiter = ",") {
    const q = (v, i) => {
        const encoder = encoders[i % encoders.length];
        if (typeof v === "undefined") {
            return "";
        }
        if (typeof v === "object") {
            if (Array.isArray(v)) {
                return v.map(encoder).join(delimiter);
            }
            const flat = Object.entries(v).reduce((flat, entry) => [...flat, ...entry], []);
            return flat.map(encoder).join(delimiter);
        }
        return encoder(String(v));
    };
    return (strings, ...values) => {
        return strings.reduce((prev, s, i) => {
            return `${prev}${s}${q(values[i], i)}`;
        }, "");
    };
}
exports.encode = encode;
/**
 * Separate array values by the given delimiter.
 */
function delimited(delimiter = ",") {
    return (params, encoders = exports.encodeReserved) => Object.entries(params)
        .filter(([, value]) => value !== undefined)
        .map(([name, value]) => encode(encoders, delimiter) `${name}=${value}`)
        .join("&");
}
exports.delimited = delimited;
/**
 * Deeply remove all properties with undefined values.
 */
function stripUndefined(obj) {
    return obj && JSON.parse(JSON.stringify(obj));
}
exports.stripUndefined = stripUndefined;
function joinUrl(...parts) {
    return parts
        .filter(Boolean)
        .map((s, i) => (i === 0 ? s : s.replace(/^\/+/, "")))
        .map((s, i, a) => (i === a.length - 1 ? s : s.replace(/\/+$/, "")))
        .join("/");
}
exports.joinUrl = joinUrl;
//# sourceMappingURL=util.js.map
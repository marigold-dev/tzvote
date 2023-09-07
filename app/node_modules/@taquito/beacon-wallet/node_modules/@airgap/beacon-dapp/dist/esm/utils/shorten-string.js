export const shortenString = (text) => {
    if (text.length >= 12) {
        return `${text.substr(0, 5)}...${text.substr(-5)}`;
    }
    return text;
};
//# sourceMappingURL=shorten-string.js.map
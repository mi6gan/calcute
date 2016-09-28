module.exports = {
    isMultiRef: (path) => Boolean(
        path.options.type &&
        typeof(path.options.type)=='object' &&
        path.options.type.length &&
        path.options.type[0] &&
        path.options.type[0].ref
    ),
    isRef: (path) => (
        Boolean(path.options.type.ref)
    )
};

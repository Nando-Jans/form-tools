// assets/babel.config.cjs

module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                modules: false,
                targets: {
                    esmodules: true,
                },
                useBuiltIns: false
            },
        ],
        [
            '@babel/preset-typescript',
            {
                allowDeclareFields: true,
            },
        ],
    ],
    assumptions: {
        superIsCallableConstructor: false,
    },
};
'use strict';

module.exports = {
    presets: [
        ['@babel/preset-env', {
            targets: {esmodules: true},
            bugfixes: true,
            useBuiltIns: false
        }]
    ],
    plugins: [
        ['@babel/plugin-transform-runtime', {
            corejs: false,
            helpers: true,
            regenerator: true,
            version: '^7.12.13'
        }]
    ]
};

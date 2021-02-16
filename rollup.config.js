'use strict';
import pluginNodeResolve from '@rollup/plugin-node-resolve';
import pluginCommonjs from '@rollup/plugin-commonjs';
import pluginTs from '@rollup/plugin-typescript';
import pluginBabel from '@rollup/plugin-babel';
import {terser as pluginTerser} from 'rollup-plugin-terser';
import pkg from './package.json';

export default {
    input: './src/index.ts',
    output: [
        {
            file: pkg.module,
            format: 'esm',
            sourcemap: true
        },
        {
            name: 'HTMLAutoCheckElement',
            file: pkg.main,
            format: 'umd',
            sourcemap: true
        }
    ],
    plugins: [
        pluginNodeResolve(),
        pluginCommonjs(),
        pluginTs(),
        pluginBabel({
            exclude: 'node_modules/**',
            babelHelpers: 'runtime',
            extensions: ['.js', '.jsx', '.es6', '.es', '.mjs', '.ts', '.tsx'],
        }),
        pluginTerser()
    ]
};

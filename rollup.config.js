'use strict';
import pluginTypescript from '@rollup/plugin-typescript';
import pluginNodeResolve from '@rollup/plugin-node-resolve';
import pluginCommonjs from '@rollup/plugin-commonjs';
import pluginBabel from 'rollup-plugin-babel';
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
        pluginTypescript(),
        pluginNodeResolve(),
        pluginCommonjs(),
        pluginBabel({
            presets: ['github'],
            exclude: 'node_modules/**',
            extensions: ['.js', '.ts'],
        }),
        pluginTerser()
    ]
};

import commonjs from '@rollup/plugin-commonjs'
import babel from '@rollup/plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'
import cleanup from 'rollup-plugin-cleanup'
import banner from 'rollup-plugin-banner'
import replace from '@rollup/plugin-replace'
import nodePolyfills from 'rollup-plugin-node-polyfills'
import { terser } from 'rollup-plugin-terser'
import pkg from './package.json'

const config = {
  input: 'src/index.js',
  context: 'this',
  output: [
    {
      file: pkg.module,
      format: 'umd',
      name: 'PrevioletSDK',
      exports: 'named',
    },
    {
      file: pkg.main,
      format: 'cjs',
      exports: 'named'
    },
    {
      file: 'demo/previolet-sdk.js',
      format: 'umd',
      name: 'PrevioletSDK',
      exports: 'named'
    },
    {
      file: 'dist/previolet-sdk.iife.js',
      format: 'iife',
      name: 'PrevioletSDK',
      exports: 'named'
    },
    {
      file: 'dist/previolet-sdk.amd.js',
      format: 'amd',
      name: 'PrevioletSDK',
      exports: 'named'
    },
    {
      file: 'dist/previolet-sdk.min.js',
      format: 'iife',
      name: 'PrevioletSDK',
      plugins: [terser()],
      exports: 'named'
    },
    {
      file: 'dist/previolet-sdk.es2015.js',
      format: 'es',
      name: 'PrevioletSDK',
      // footer: 'export default PrevioletSDK;',
      exports: 'named'
    },
  ],
  plugins: [
    resolve({
      mainFields: ['main', 'module'],
      browser: true,
      preferBuiltins: true,
      module: false,
    }), 
    commonjs(), 
    json(), 
    nodePolyfills(),
    cleanup({ comments: 'none' }),
    banner('Previolet Javascript SDK v<%= pkg.version %>\nhttps://github.com/previolet/previolet-js-sdk\nReleased under the MIT License.'),
    babel({
      babelHelpers: 'bundled',
      plugins: [
        '@babel/plugin-proposal-object-rest-spread', 
        '@babel/plugin-proposal-async-generator-functions',
      ],
    }),
    replace({
      __SDK_VERSION__: pkg.version
    })
  ]
};

export default config
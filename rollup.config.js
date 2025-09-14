import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import serve from 'rollup-plugin-serve';
import json from '@rollup/plugin-json';

const dev = process.env.ROLLUP_WATCH;

const serveopts = {
  contentBase: ['./dist'],
  host: '0.0.0.0',
  port: 5000,
  allowCrossOrigin: true,
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
};

const plugins = [
  nodeResolve({
    browser: true,
    preferBuiltins: false,
  }),
  commonjs(),
  json(),
  typescript({
    sourceMap: dev,
  }),
  dev && serve(serveopts),
  !dev && terser(),
].filter(Boolean);

export default {
  input: 'src/custom-picture-elements-card.ts',
  output: {
    file: 'dist/custom-picture-elements-card.js',
    format: 'es',
    name: 'CustomPictureElementsCard',
    sourcemap: dev,
    inlineDynamicImports: true,
  },
  plugins,
  external: [
    // Don't bundle these - they should be provided by Home Assistant
    /^@lit-labs/,
    /^lit/,
  ],
  watch: {
    exclude: ['node_modules/**'],
  },
};
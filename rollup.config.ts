import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import fs from 'fs'
import readPkgUp from 'read-pkg-up'
// import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import json from '@rollup/plugin-json'
import typescript from 'rollup-plugin-typescript2'
import path from 'path'

const { pkg } = readPkgUp.sync({ cwd: fs.realpathSync(process.cwd()) })

export default {
  input: 'index.ts',
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    // ...fs.readdirSync(path.resolve(__dirname, './packages')).map(it => '@mtfe/' + it)
  ],
  output: [{
    file: pkg.main,
    format: 'cjs',
    name: pkg.name,
    sourcemap: true
  }],
  plugins: [
    json(),
    resolve({
      extensions: ['.ts', '.js']
    }),
    commonjs(),
    typescript()
  ]
}

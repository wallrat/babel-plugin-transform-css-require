import { resolve, dirname, isAbsolute } from 'path';
import { readFileSync, existsSync } from 'fs';
import CleanCSS from 'clean-css';

function resolveWithModulePath(filename) {
    const dir = dirname(filename);
    if (isAbsolute(dir)) return resolve(dir);
    if (process.env.PWD) return resolve(process.env.PWD, dir);
    return resolve(dir);
}

export function fetchCssModule(fromFile,name) {
  const relativeTo = resolveWithModulePath(fromFile)
  const absolute = resolve(relativeTo,name)
  if (!existsSync(absolute)) {
    return null;
  }
  const source =  readFileSync(absolute,'utf-8')
  const minified = new CleanCSS({advanced: false}).minify(source).styles
  return minified
}

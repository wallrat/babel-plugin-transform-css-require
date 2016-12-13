import { resolve, dirname, isAbsolute } from 'path';
import { readFileSync, existsSync } from 'fs';
import CleanCSS from 'clean-css';

function resolveModulePath(filename) {
    const dir = dirname(filename);
    if (isAbsolute(dir)) return resolve(dir);
    if (process.env.PWD) return resolve(process.env.PWD, dir);
    return resolve(dir);
}

export function fetchCssModule(fromFile,moduleName) {
  let filename = moduleName

  // only resolve path to file when we have a file path
  if (!/^\w/i.test(filename)) {
     const dir = dirname(fromFile)
     filename = resolve(dir,filename)
   } else {
     filename = "./node_modules/" + moduleName
   }

  const absolute = isAbsolute(filename) ? filename : resolve(filename)

  if (!existsSync(absolute)) {
    return null;
  }
  const source =  readFileSync(absolute,'utf-8')
  const minified = new CleanCSS({advanced: false}).minify(source).styles
  return minified
}

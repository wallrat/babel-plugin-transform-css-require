var crypto = require('crypto');
import { fetchCssModule } from './css'

export default function ({types: t}) {
  return {
    visitor: {
      ImportDeclaration(path, { file }) {
          // this method is called between enter and exit, so we can map css to our state
          // it is then replaced with require call which will be handled in seconds pass by CallExpression
          // CallExpression will then replace it or remove depending on parent node (if is Program or not)
          const { value } = path.node.source;

          // we only care about .css
          if (!value || !value.endsWith('.css')) {
            return
          }

          // default specifier (import XXX from './foo.css')
          // const defaultSpecifier = path.node.specifiers[0].local.name
          // console.log('defaultSpecifier',defaultSpecifier)

          // replace with require
          path.replaceWith(
            t.callExpression(
              t.identifier('require'),
              [
                t.stringLiteral(value)
              ]
            )
          )
      },

      CallExpression(path, {file}) {
        const {callee: {name : calleeName}, arguments: args} = path.node

        // we only care about 'require' calls
        if (calleeName !== 'require' || !args.length || args.length !== 1 || !t.isStringLiteral(args[0])) {
          return;
        }

        // we only care about .css requires
        if (!args[0].value.endsWith('.css')) {
          return;
        }

        const filename = args[0].value
        const css = fetchCssModule(file.opts.filename,filename)

        if (!css) {
          // if this node was originaly an ImportDeclaration babel will report this
          // error as originating from an 'internal' node. It would be nice to get the
          // same syntax error as from an original require() statement.
          throw path.buildCodeFrameError(`Could not load CSS ${filename}`);
        }

        const md5 = crypto.createHash('md5').update(css).digest("hex");

        // require('./test.css') => require('inject-style-tag').inject('h1 { color: red}')
        path.replaceWith(t.callExpression(
          t.memberExpression(t.callExpression(t.identifier('require'),
            [
              t.stringLiteral('inject-style-tag')
            ]),t.identifier('inject')),
          [
            t.stringLiteral(css),
            t.stringLiteral(md5)
          ]))

        path.skip()
      }
    }
  };
}

const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const generator = require('@babel/generator').default;

const path = require('path');

const template = require('@babel/template').default;

module.exports = function (source) {
  // 在这里按照你的需求处理 source
  // 可以通过 this.getOptions 或者 this.query 来获取参数
  const options = this.getOptions();
  const filename = path.basename(this.resourcePath);

  let ast = parser.parse(source, {
    sourceType: 'module', // 支持 es6 module
    plugins: ['dynamicImport', 'jsx', 'typescript'] // 支持动态 import
  });
  let hasImportStatement = false;
  traverse(ast, {
    ImportDeclaration(path) {
      if (path.node.source.value === options.path) {
        hasImportStatement = true;
      }
    },
    ReturnStatement(path) {
      const { node } = path;
      if (t.isJSXElement(node.argument) || (t.isJSXFragment(node.argument) && filename !== `${options.name}.tsx`)) {
        const jsxElement = node.argument;
        // 包裹 Children 组件
        path.skip();
        path.replaceWith(t?.returnStatement(wrapWithChildren(jsxElement, options)));
      }
    }
  });

  if (!hasImportStatement && filename !== `${options.name}.tsx`) {
    const importStatement = template.ast(`import ${options?.name} from '${options.path}';`);
    ast.program.body.unshift(importStatement);
  }

  const output = generator(ast, {}, source);

  return output.code;
};

function wrapWithChildren(node, options) {
  // 创建 Children 组件
  return t.jsxElement(
    t.jsxOpeningElement(t.jsxIdentifier(options.name), []),
    t.jsxClosingElement(t.jsxIdentifier(options.name)),
    [node],
    false
  );
}

const fs = require('fs');
const babylon = require('babylon');
const traverse = require('@babel/traverse').default;
const { transformFromAst } = require('@babel/core');
const path = require('path');
// const traverse = require('babel-traverse').default;
// 要获取到文件的内容和依赖关系
function createAssets(filename) {
  const source = fs.readFileSync(filename, 'utf-8');
  // 获取文件的依赖关系
  // 通过 ast 解析来获取到依赖
  /// ast 三板斧是什么？
  const deps = [];
  const ast = babylon.parse(source, {
    sourceType: 'module',
  });
  // 将es6转为es5代码
  const { code } = transformFromAst(ast, null, {
    presets: ['env'],
  });
  traverse(ast, {
    ImportDeclaration: ({ node }) => {
      deps.push(node.source.value);
    },
  });
  return {
    source,
    deps,
    code,
    filename,
  };
}
function createGraph(filename) {
  const mainAssets = createAssets(filename);
  const dirname = path.dirname(filename);
  const queue = [mainAssets];
  for (const asset of queue) {
    asset.deps.forEach((relativePath) => {
      const absolutePath = path.join(__dirname, dirname, relativePath);
      const child = createAssets(absolutePath);
      queue.push(child);
    });
  }
  return queue;
}

function bundle(graph) {
  function createModules() {
    const modules = {};
    graph.forEach((asset) => {
      modules[asset.filename] = asset.code;
    });
    return modules;
  }
  const modules = createModules();
  console.log(modules);
}
bundle(createGraph('../example/main.js'));

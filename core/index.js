/** @format */

const fs = require('fs');
const babylon = require('babylon');
const traverse = require('@babel/traverse').default;
const { transformFromAst } = require('@babel/core');
const ejs = require('ejs');
const path = require('path');
// const traverse = require('babel-traverse').default;
// 要获取到文件的内容和依赖关系
let id = 1;
function createAssets(filename) {
  const source = fs.readFileSync(filename, 'utf-8');
  // 获取文件的依赖关系
  // 通过 ast 解析来获取到依赖
  /// ast 三板斧是什么？
  const deps = [];
  const ast = babylon.parse(source, {
    sourceType: 'module',
  });

  traverse(ast, {
    ImportDeclaration: ({ node }) => {
      deps.push(node.source.value);
    },
  });
  // 将es6转为es5代码
  const { code } = transformFromAst(ast, null, {
    presets: ['env'],
  });
  return {
    id: id++,
    source,
    deps,
    code,
    filename,
    mapping: {},
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
      asset.mapping[relativePath] = child.id;
      queue.push(child);
    });
  }
  return queue;
}

function bundle(graph) {
  function createModules() {
    const modules = {};
    graph.forEach((asset) => {
      modules[asset.id] = [asset.code, asset.mapping];
    });
    return modules;
  }
  function emitFiles(context) {
    fs.writeFileSync('../bundle.js', context);
  }
  const modules = createModules();
  console.log(modules);
  const bundleTemplate = fs.readFileSync(
    path.join(__dirname, 'bundle.ejs'),
    'utf-8'
  );
  // console.log(modules);
  const code = ejs.render(bundleTemplate, { modules });
  console.log(code);
  emitFiles(code);
}
bundle(createGraph('../example/main.js'));

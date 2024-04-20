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
let globalConfig = {};
function createAssets(filename) {
  let source = fs.readFileSync(filename, 'utf-8');

  const loaders = globalConfig.module.rules;
  loaders.forEach((loader) => {
    const { test, use } = loader;
    if (test.test(filename)) {
      // 暂时用本地函数代替
      // const loaderPath = path.join(__dirname, use);
      // const loader = require(loaderPath);
      source = use(source);
    }
  });
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
function createGraph() {
  const mainAssets = createAssets(globalConfig.entry);
  const dirname = path.dirname(globalConfig.entry);
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
    fs.writeFileSync(globalConfig.output, context);
  }
  const modules = createModules();
  console.log(modules);
  const bundleTemplate = fs.readFileSync(
    path.join(__dirname, 'bundle.ejs'),
    'utf-8'
  );
  // console.log(modules);
  const code = ejs.render(bundleTemplate, { modules });
  emitFiles(code);
}
function mdLoader(source) {
  console.log('mdLoader-------------');
  return `export default '${source}'`;
}

function webpack(webpackConfig) {
  globalConfig = webpackConfig;
  const graph = createGraph();
  bundle(graph);
}

webpack({
  entry: '../example/main.js',
  output: '../dist/bundle.js',
  module: {
    rules: [
      {
        test: /\.md$/,
        use: mdLoader,
      },
    ],
  },
});

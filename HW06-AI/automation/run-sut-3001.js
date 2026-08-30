const fs = require('fs');
const Module = require('module');
const path = require('path');

const backend = 'D:\\CODE\\eshop-sut\\backend';
const sourcePath = path.join(backend, 'server.js');
const source = fs.readFileSync(sourcePath, 'utf8').replace(
  'const PORT = 3000;',
  'const PORT = 3001;',
);
const instance = new Module(path.join(backend, 'server.hw06-3001.js'), module);
instance.filename = path.join(backend, 'server.hw06-3001.js');
instance.paths = Module._nodeModulePaths(backend);
instance._compile(source, instance.filename);

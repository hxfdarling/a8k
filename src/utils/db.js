const fs = require('fs-extra');
const path = require('path');
const low = require('lowdb');
const envPaths = require('env-paths');
const FileSync = require('lowdb/adapters/FileSync');

const paths = envPaths('IMT');

fs.ensureDirSync(paths.data);

const adapter = new FileSync(path.join(paths.data, 'data.db'));

const db = low(adapter);

db.set('version', require('../../package.json').version).write();

module.exports = db;

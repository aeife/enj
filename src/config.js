import fs from 'fs';
import path from 'path';
import winston from 'winston';

let filePath;
let configFile;
let config;

export default {
  get,
  set
};

function get () {
  if (!config) {
    init();
  }
  return config;
}

function set (key, value, cb) {
  config[key] = value;
  save(cb);
}

function save (cb) {
  fs.writeFile(configFile, JSON.stringify(config, null, 2), err => {
    if(err) {
      winston.error('error while saving settings');
      winston.debug(err);
    } else {
      winston.debug('setting saved');
      if (cb) {
        cb();
      }
    }
  });
}

function init () {
  filePath = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
  configFile = filePath + '/.enj';
  config = fs.existsSync(configFile) ? JSON.parse(fs.readFileSync(configFile, 'utf8')) : {};
}

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

function set (key, value) {
  config[key] = value;
  save();
}

function save () {
  fs.writeFile(configFile, JSON.stringify(config, null, 2), err => {
    if(err) {
      winston.error('error while saving settings');
      winston.debug(err);
    } else {
      winston.debug('setting saved');
    }
  });
}

function init () {
  filePath = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
  configFile = filePath + '/.enj';
  config = fs.existsSync(configFile) ? JSON.parse(fs.readFileSync(configFile, 'utf8')) : {};
}

import fs from 'fs';
import path from 'path';
import winston from 'winston';
import { handleError } from './errorHandler';

let filePath;
let configFile;
let config;

export default {
  get,
  set,
  options: {
    DEVTOKEN: 'DEVTOKEN',
    NOTEBOOK: 'NOTEBOOK',
    SANDBOX: 'SANDBOX',
    DATEFORMAT: 'DATEFORMAT',
    TIMEFORMAT: 'TIMEFORMAT'
  },
  timeFormats: {
      H24: 'HH:mm',
      H12: 'hh:mm a'
  },
  dateFormats: {
    AMERICAN: 'MMMM Do YYYY',
    EUROPEAN: 'DD. MMMM YYYY'
  }
};

function get () {
  if (!config) {
    init();
  }
  return config;
}

function set (key, value, cb) {
  if (!config) {
    init();
  }
  config[key] = value;
  save(cb);
}

function save (cb) {
  fs.writeFile(configFile, JSON.stringify(config, null, 2), err => {
    handleError(err, 'saving settings');
    winston.debug('setting saved');
    if (cb) {
      cb();
    }
  });
}

function init () {
  filePath = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
  configFile = filePath + '/.enj';
  config = fs.existsSync(configFile) ? JSON.parse(fs.readFileSync(configFile, 'utf8')) : {};
}

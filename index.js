import evernoteClient from './src/evernoteClient';
import config from './src/config.js';
import prompts from './src/prompts.js';
import program from 'commander';
import winston from 'winston';
import async from 'async';

// prevent evernote sdk from logging to console
console.log = () => {};
winston.level = 'debug';

async.series([ensureDeveloperTokenConfig, ensureNotebookConfig], cb => {
  program
    .version('0.0.1');
  program.parse(process.argv);

  if (program.args.length) {
    saveTextInEvernote(program.args.join(' '));
  } else {
    prompts.multiLineEntry(saveTextInEvernote);
  }
});

function ensureDeveloperTokenConfig (cb) {
  if (!config.get().developerKey) {
    prompts.requestDeveloperToken(cb);
  } else {
    cb()
  }
}

function ensureNotebookConfig (cb) {
  if (!config.get().notebook) {
    prompts.requestJournalNotebook(cb);
  } else {
    cb();
  }
}

function saveTextInEvernote (text) {
  evernoteClient.init(() => {
    evernoteClient.addText(text);
  });
}

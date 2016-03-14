import evernoteClient from './src/evernoteClient';
import config from './src/config.js';
import prompts from './src/prompts.js';
import program from 'commander';
import winston from 'winston';
import async from 'async';

// prevent evernote sdk from logging to console
console.log = () => {};

let cmdExecuted = false;

program
  .version('0.0.1')
  .description(`
    enj - the evernote journal for your terminal
    A simple command line interface for creating journals in evernote.
  `)
  .option('--verbose', 'enable additional log outputs', () => {
    winston.level = 'debug'
  });
program
  .command('config')
  .description('change current configuration')
  .action(function(){
    cmdExecuted = true;
    prompts.configOptions(() => {
      process.exit(0);
    });
  });

program
  .command('* [text...]')
  .description('direct text inut or no text to start multi line input mode')
  .action(function(text){
    cmdExecuted = true;
    async.series([ensureDeveloperTokenConfig, ensureNotebookConfig], cb => {
      saveTextInEvernote(text.join(' '));
    });
  });

program.parse(process.argv);

if (!cmdExecuted) {
  async.series([ensureDeveloperTokenConfig, ensureNotebookConfig], cb => {
    prompts.multiLineEntry(saveTextInEvernote);
  });
}

function ensureDeveloperTokenConfig (cb) {
  if (!config.get().developerKey) {
    prompts.requestDeveloperToken(cb);
  } else {
    cb();
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

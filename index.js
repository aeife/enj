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
  let cmdExecuted = false;

  program
    .version('0.0.1');

  program
    .command('* [text...]')
    .description('text input')
    .action(function(text){
      cmdExecuted = true;
      saveTextInEvernote(text.join(' '));
    });

  program
    .command('config')
    .description('configuration')
    .action(function(){
      cmdExecuted = true;
      prompts.configOptions(configure);
    });

  program.parse(process.argv);

  if (!cmdExecuted) {
    prompts.multiLineEntry(saveTextInEvernote);
  }
});

function configure (configOption) {
  switch (configOption) {
    case 'notebook':
      prompts.requestJournalNotebook(() => {
        process.exit(0);
      });
      break;
    case 'devToken': {
      prompts.requestDeveloperToken(() => {
        process.exit(0);
      });
    }
  }
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

import evernoteClient from './src/evernoteClient';
import config from './src/config.js';
import prompts from './src/prompts.js';
import program from 'commander';
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import winston from 'winston';

// prevent evernote sdk from logging to console
console.log = () => {};
winston.level = 'debug';

if (!config.get().developerKey) {
  prompts.requestDeveloperToken(() => {});
} else if (!config.get().notebook) {
  prompts.requestJournalNotebook(() => {});
} else {
  program
    .version('0.0.1');
  program.parse(process.argv);

  if (program.args.length) {
    saveTextInEvernote(program.args.join(' '));
  } else {
    prompts.multiLineEntry(saveTextInEvernote);
  }
}

function saveTextInEvernote (text) {
  evernoteClient.init(() => {
    evernoteClient.addText(text);
  });
}

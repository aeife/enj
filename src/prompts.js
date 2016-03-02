import config from './config.js';
import evernoteClient from './evernoteClient.js';
import winston from 'winston';
import inquirer from 'inquirer';
import readline from 'readline';

export default {
  requestDeveloperToken,
  requestJournalNotebook,
  multiLineEntry,
  configOptions
};

function requestDeveloperToken (cb) {
  console.info(`
    Please fill in your developer token');
    To get a developer token, visit https://sandbox.evernote.com/api/DeveloperToken.action
  `);
  inquirer.prompt([{
    type: 'input',
    name: 'key',
    message: '>'
  }], answer => {
    config.set('developerKey', answer.key);
    cb();
  });
}

function requestJournalNotebook (cb) {
  evernoteClient.init(() => {
    evernoteClient.getNotebooks(notebooks => {
      inquirer.prompt([{
        type: "list",
        name: "notebook",
        message: "Choose a notebook for your journal",
        choices: notebooks.map(notebook => notebook.name)
      }], answer => {
        config.set('notebook', notebooks.find(notebook => notebook.name === answer.notebook).guid);
        cb();
      });
    })
  });
}

function multiLineEntry (cb) {
  console.info(`
    Welcome to ENJ, the evernote journal in your terminal.
    This is the multi line mode.
    Quit process (Cmd/Ctrl + C) or type 'q' and press enter to submit your text.
  `);

  const input = [];
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.setPrompt('')
  rl.prompt();

  rl.on('line', function (cmd) {
    if (cmd === 'q') {
      rl.close();
    } else {
      input.push(cmd);
    }
  });

  rl.on('close', function (cmd) {
    cb(input.join('\n'));
  });
}

function configOptions (cb) {
  inquirer.prompt([{
    type: "list",
    name: "config",
    message: "What do you want to configure?",
    choices: [{
      name: 'Journal Notebook',
      value: 'notebook'
    }]
  }], answer => {
    cb(answer.config);
  });
}

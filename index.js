import evernoteClient from './src/evernoteClient';
import config from './src/config.js';
import program from 'commander';
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import winston from 'winston';

// prevent evernote sdk from logging to console
console.log = () => {};
winston.level = 'debug';

if (!config.get().developerKey) {
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
  });
} else if (!config.get().notebook) {
  evernoteClient.init(() => {
    evernoteClient.getNotebooks(notebooks => {
      inquirer.prompt([{
        type: "list",
        name: "notebook",
        message: "Choose a notebook for your journal",
        choices: notebooks.map(notebook => notebook.name)
      }], answer => {
        config.set('notebook', notebooks.find(notebook => notebook.name === answer.notebook).guid);
      });
    })
  });
} else {
  program
    .version('0.0.1');
  program.parse(process.argv);

  if (program.args.length) {
    saveTextInEvernote(program.args.join(' '));
  } else {
    console.info(`
      Welcome to ENJ, the evernote journal in your terminal.
      This is the multi line mode.
      Type 'q' and press enter to submit your text
    `);
    multiLineText();
  }
}

function saveTextInEvernote (text) {
  evernoteClient.init(() => {
    evernoteClient.addText(text);
  });
}

function multiLineText(text = '') {
  inquirer.prompt([{
    type: "input",
    name: "text",
    message: ">"
  }], answer => {
      if (answer.text === "q") {
        saveTextInEvernote(text);
      } else {
          text += answer.text + "\n";
          multiLineText(text);
      }
  });
}

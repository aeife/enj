import evernoteClient from './src/evernoteClient';
import program from 'commander';
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import winston from 'winston';

// prevent evernote sdk from logging to console
console.log = () => {};

const filePath = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
const configFile = filePath + '/.enj';
const config = fs.existsSync(configFile) ? JSON.parse(fs.readFileSync(configFile, 'utf8')) : {};
if (!config.developerKey) {
  console.info(`
    Please fill in your developer token');
    To get a developer token, visit https://sandbox.evernote.com/api/DeveloperToken.action
  `);
  inquirer.prompt([{
    type: 'input',
    name: 'key',
    message: '>'
  }], answer => {
    config.developerKey = answer.key;
    fs.writeFile(configFile, JSON.stringify(config, null, 2), err => {
      if(err) {
        winston.error('error while saving settings');
        winston.debug(err);
      } else {
        winston.debug('setting saved');
      }
    });
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
  evernoteClient.init(config, () => {
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

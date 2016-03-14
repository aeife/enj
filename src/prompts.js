import config from './config.js';
import evernoteClient from './evernoteClient.js';
import winston from 'winston';
import inquirer from 'inquirer';
import readline from 'readline';

export default {
  requestDeveloperToken,
  requestJournalNotebook,
  multiLineEntry,
  selectSandboxMode,
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
    config.set('developerKey', answer.key, cb);
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
        config.set('notebook', notebooks.find(notebook => notebook.name === answer.notebook).guid, cb);
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

function selectSandboxMode (cb) {
  inquirer.prompt([{
    type: "confirm",
    name: "sandbox",
    message: "Do you want to use evernote sandbox mode?",
    default: false
  }], answer => {
    config.set('sandbox', answer.sandbox, cb);
  });
}

function configOptions (cb) {
  inquirer.prompt([{
    type: "list",
    name: "config",
    message: "What do you want to configure?",
    choices: [{
      name: 'Journal Notebook',
      value: config.options.NOTEBOOK
    }, {
      name: 'Developer Token',
      value: config.options.DEVTOKEN
    }, {
      name: 'Sandbox Mode',
      value: config.options.SANDBOX
    }, {
      name: 'Date Format',
      value: config.options.DATEFORMAT
    }, {
      name: 'Time Format',
      value: config.options.TIMEFORMAT
    }]
  }], answer => {
    switch (answer.config) {
      case config.options.NOTEBOOK:
        requestJournalNotebook(() => {
          cb();
        });
        break;
      case config.options.DEVTOKEN:
        requestDeveloperToken(() => {
          cb();
        });
        break;
      case config.options.SANDBOX:
        selectSandboxMode(() => {
          cb();
        });
        break;
      case config.options.TIMEFORMAT:
        configureTimeFormat(() => {
          cb();
        });
        break;
      case config.options.DATEFORMAT:
        configureDateFormat(() => {
          cb();
        });
        break;
    }
  });
}

function configureTimeFormat (cb) {
  inquirer.prompt([{
    type: "list",
    name: "timeFormat",
    message: "Choose a time format for your journal",
    default: config.get().timeformat === config.timeFormats.H24? 1 : 0,
    choices: [{
      name: '12h - 03:36 pm',
      value: config.timeFormats.H12
    }, {
      name: '24h - 15:36',
      value: config.timeFormats.H24
    }]
  }], answer => {
    config.set('timeformat', answer.timeFormat, cb);
  });
}

function configureDateFormat (cb) {
  inquirer.prompt([{
    type: "list",
    name: "dateFormat",
    message: "Choose a date format for your journal",
    default: config.get().dateformat === config.dateFormats.EUROPEAN ? 1 : 0,
    choices: [{
      name: 'March 14th 2016',
      value: config.dateFormats.AMERICAN
    }, {
      name: '14. March 2016',
      value: config.dateFormats.EUROPEAN
    }]
  }], answer => {
    config.set('dateformat', answer.dateFormat, cb);
  });
}

import evernoteClient from './src/evernoteClient';
import program from 'commander';
import config from './config.json';

if (!config.developerKey) {
  console.log('Please fill in your developer token');
  console.log('To get a developer token, visit https://sandbox.evernote.com/api/DeveloperToken.action');
  process.exit(1);
}

program
  .version('0.0.1');
program.parse(process.argv);

if (program.args.length) {
  evernoteClient.init(config, () => {
    evernoteClient.addText(program.args.join(' '));
  });
}

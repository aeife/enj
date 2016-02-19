import evernoteClient from './src/evernoteClient';
import program from 'commander';

program
  .version('0.0.1');
program.parse(process.argv);

if (program.args.length) {
  evernoteClient.init(() => {
    evernoteClient.addText(program.args.join(' '));
  });
}

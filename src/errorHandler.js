import winston from 'winston';

export function handleError (err, errorMsg) {
  if (err) {
    winston.error(`${errorMsg}`);
    winston.debug(err);
    process.exit(1);
  }
};

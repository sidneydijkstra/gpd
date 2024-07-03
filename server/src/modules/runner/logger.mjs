import fs from 'fs';

export class FileLogger {
  constructor(filePath) {
    this.filePath = filePath;
  }

  log(...messages) {
    // Format the messages with a timestamp
    const timestamp = new Date().toISOString();
    const logMessages = messages.map(message => `${JSON.stringify(message)}`);

    // Append the log messages to the file
    try {
      fs.appendFileSync(this.filePath, `${timestamp}: ` + logMessages.join('') + '\n');
    } catch (error) {
      console.error('Error writing to log file:', error);
    }
  }

  error(...messages) {
    this.log(`ERROR: ${messages}`);
  }
}
import fs from 'fs';

export class FileLogger {
  constructor(filePath) {
    this.filePath = filePath;
    this.recording = '';
  }

  log(...messages) {
    // Format the messages with a timestamp
    const timestamp = new Date().toISOString();
    const logMessages = messages.map(message => `${JSON.stringify(message)}`);

    // Append the log messages to the file
    try {
      var message = `${timestamp}: ` + logMessages.join('') + '\n'
      this.recording += message;
      fs.appendFileSync(this.filePath, `${timestamp}: ` + logMessages.join('') + '\n');
    } catch (error) {
      console.log('[FileLogger] Error writing to log file:', error);
    }
  }

  record(){
    this.recording = '';
  }

  recordResult(){
    return this.recording;
  }

  error(...messages) {
    this.log(`ERROR: ${messages}`);
  }
}
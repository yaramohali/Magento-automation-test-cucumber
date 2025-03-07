// This is a simple logger file that helps us print messages to the console
// and also saves them to a log file so we can look at them later
const fs = require('fs');
const path = require('path');

// The Logger class handles all our logging needs
class Logger {
    constructor() {
        // Create a folder to store our logs
        this.logsFolder = path.join(process.cwd(), 'logs');
        
        // This creates a new log file with the current date and time
        this.logFile = path.join(this.logsFolder, `test-log-${Date.now()}.txt`);
        
        // Make sure the logs folder exists before we try to write to it
        if (!fs.existsSync(this.logsFolder)) {
            fs.mkdirSync(this.logsFolder, { recursive: true });
        }
        
        // Create an empty log file to start with
        fs.writeFileSync(this.logFile, 'Test Log Started\n');
        console.log(`Log file created at: ${this.logFile}`);
    }

    // Function to log regular informational messages
    info(message, data = null) {
        this.logMessage('INFO', message, data);
    }

    // Function to log warning messages
    warn(message, data = null) {
        this.logMessage('WARNING', message, data);
    }

    // Function to log error messages
    error(message, data = null) {
        this.logMessage('ERROR', message, data);
    }

    // Function to log test steps
    step(message) {
        this.logMessage('STEP', message);
    }

    // This is the main function that actually writes the log
    logMessage(level, message, data = null) {
        // Get the current time
        const now = new Date();
        const timestamp = now.toISOString();
        
        // Format the log message
        let logText = `[${timestamp}] [${level}] ${message}`;
        
        // Add the data if there is any
        if (data) {
            if (typeof data === 'object') {
                logText += ' ' + JSON.stringify(data);
            } else {
                logText += ' ' + data;
            }
        }
        
        // Print to the console with different colors based on log level
        if (level === 'ERROR') {
            console.log('\x1b[31m%s\x1b[0m', logText); // Red text for errors
        } else if (level === 'WARNING') {
            console.log('\x1b[33m%s\x1b[0m', logText); // Yellow text for warnings
        } else if (level === 'STEP') {
            console.log('\x1b[36m%s\x1b[0m', logText); // Cyan text for steps
        } else {
            console.log(logText); // Normal text for info
        }
        
        // Also save to the log file
        try {
            fs.appendFileSync(this.logFile, logText + '\n');
        } catch (error) {
            console.error(`Failed to write to log file: ${error.message}`);
        }
    }
}

// Create a single instance of the logger that we can use throughout the code
const logger = new Logger();

// Export the logger so we can use it in other files
module.exports = logger;

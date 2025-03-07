/**
 * Cucumber Test Setup File
 * 
 * This file configures the testing environment before tests run.
 * It's loaded automatically by Cucumber when tests start.
 * 
 * What this file does:
 * Sets up Babel to allow us to use modern JavaScript features in our tests.
 * Babel will convert modern code to be compatible with the current Node.js version.
 */

// Register Babel to process our JavaScript files
// This lets us use newer JavaScript features that Node.js might not support natively
require('@babel/register')({
    // Tell Babel which file types to process
    extensions: ['.js', '.ts', '.tsx'],
    
    // Don't process files in node_modules - this would slow things down a lot
    ignore: [/node_modules/]
});


console.log('✅ Test environment setup complete - Cucumber tests are ready to run!');

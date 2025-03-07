/**
 * Babel Configuration File
 * 
 * This file configures Babel, which is a tool that converts modern JavaScript code
 * to older syntax for compatibility with different browsers and environments.
 * 
 * Why do we need this?
 * 1. We can write our tests using modern JavaScript features (ES6+)
 * 2. Babel will convert them to be compatible with the Node.js version we're using
 * 3. This lets us use features like async/await, arrow functions, etc.
 */

module.exports = {
    // Presets are pre-configured sets of Babel plugins
    presets: [
        // We're using the 'env' preset which automatically determines
        // which JavaScript features need to be transformed based on our target environment
        ['@babel/preset-env', {
            targets: {
                // We're targeting the current version of Node.js
                // This means Babel will only transform features not supported in our Node version
                node: 'current'
            }
        }]
    ]
    
    // If you need to support specific JavaScript features, you can add plugins here
    // plugins: [
    //   For example, to support class properties:
    //   '@babel/plugin-proposal-class-properties'
    // ]
};

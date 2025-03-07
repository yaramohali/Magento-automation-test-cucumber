// This is the main configuration file for WebdriverIO
// It tells the test runner how to set up and run our tests
// Load environment variables from .env file (if it exists)
require('dotenv').config();

exports.config = {
    // Tell WebdriverIO that we want to run tests locally, not in the cloud
    runner: 'local',
    
    // Define which test files to run (all .feature files in the features folder)
    specs: [
        './features/**/*.feature'
    ],
    
    // If you want to skip certain test files, add them here
    exclude: [],
    
    // Maximum number of parallel test instances
    maxInstances: 1, // Reduced to 1 for stability
    
    // Define which browsers to use for testing
    capabilities: [{
        // How many instances of this browser to run at once
        maxInstances: 1, // Reduced to 1 for stability
        
        // Which browser to use
        browserName: 'chrome',
        
        // Allow testing on sites with invalid SSL certificates
        acceptInsecureCerts: true,
        
        // Chrome-specific options
        'goog:chromeOptions': {
            // Browser window size, headless mode (no visible browser)
            args: [
                '--window-size=1920,1080',  // Full HD resolution
                '--headless=new',           // Use new headless mode
                '--disable-gpu',            // Disable GPU acceleration
                '--no-sandbox',             // Disable sandbox for stability
                '--disable-dev-shm-usage'   // Overcome limited resource problems
            ]
        }
    }],
    
    // How much information to output in logs
    // Options: trace | debug | info | warn | error | silent
    logLevel: 'info',
    
    // Stop tests after how many failures (0 = don't stop)
    bail: 0,
    
    // The website URL we're testing
    // Use environment variable if available, otherwise use the Magento demo site
    baseUrl: process.env.BASE_URL || 'https://magento.softwaretestingboard.com/',
    
    // How long to wait for elements to appear (in milliseconds)
    waitforTimeout: 30000,
    
    // How long to try connecting to the browser before giving up
    connectionRetryTimeout: 180000,
    
    // How many times to retry connecting to the browser
    connectionRetryCount: 5,
    
    // Additional services to use (like browser drivers)
    services: ['chromedriver'],
    
    // We're using Cucumber for our tests
    framework: 'cucumber',
    
    // How to report test results
    reporters: [
        // Show results in the console
        'spec',
        
        // Generate Allure reports (nice HTML reports)
        ['allure', {
            outputDir: 'allure-results',
            disableWebdriverStepsReporting: true,
            disableWebdriverScreenshotsReporting: false,
        }]
    ],
    
    // Cucumber-specific options
    cucumberOpts: {
        // Where to find step definitions
        require: ['./features/step_definitions/**/*.js'],
        
        // Show full error stack traces
        backtrace: false,
        
        // Use Babel to support modern JavaScript
        requireModule: ['@babel/register'],
        
        // Don't run tests, just check if they're valid
        dryRun: false,
        
        // Fail if there are pending or undefined steps
        failFast: false,
        
        // Format of the output
        format: ['pretty'],
        
        // Hide source code in output
        snippets: true,
        
        // Show source in output
        source: true,
        
        // Show profile in output
        profile: [],
        
        // Set timeout for step definitions (in milliseconds)
        timeout: 120000
    },
    
    // =====
    // Hooks
    // =====
    // These are functions that run at specific points during test execution
    
    // Before starting tests
    before: function (capabilities, specs) {
        // Make the browser window full-screen
        browser.maximizeWindow();
        
        // Add extra logs to help with debugging
        console.log('Starting tests with browser:', capabilities.browserName);
        console.log('Testing website:', this.baseUrl);
    },
    
    // After each test step
    afterStep: async function (step, scenario, { error, duration, passed }) {
        // If the step failed, take a screenshot
        if (error) {
            console.log('Step failed! Taking screenshot...');
            await browser.takeScreenshot();
        }
    },
    
    // After each test scenario
    afterScenario: async function (world, result) {
        // Delete cookies to start with a clean state for the next test
        console.log('Test scenario completed, cleaning up...');
        await browser.deleteCookies();
    }
};

/**
 * Base Page Object Class
 * 
 * This is the main class that all our page objects will inherit from.
 * It contains common methods that are used across different pages.
 * I found this pattern in a tutorial about "Page Object Model" design pattern.
 */
class Page {
    /**
     * Opens a page in the browser
     * @param {string} path - The URL path to navigate to (will be added to the base URL)
     * @returns {Promise} - WebdriverIO browser command
     */
    open(path) {
        console.log(`Opening page: ${path}`);
        // Using the full URL is more reliable for beginners
        return browser.url('https://magento.softwaretestingboard.com/' + path);
    }
    
    /**
     * Waits for an element to be visible on the page
     * @param {Object} element - The WebdriverIO element
     * @param {Number} timeout - How long to wait (in milliseconds)
     */
    async waitForDisplayed(element, timeout = 10000) {
        try {
            console.log('Waiting for element to be displayed...');
            // Wait for the element to be visible on the page
            await element.waitForDisplayed({ timeout });
            console.log('Element is now displayed!');
        } catch (error) {
            console.log('ERROR: Element was not displayed within the timeout');
            // Taking a screenshot can help us debug if elements aren't showing up
            await browser.takeScreenshot();
            throw error;
        }
    }
    
    /**
     * Waits for an element to be clickable
     * @param {Object} element - The WebdriverIO element
     * @param {Number} timeout - How long to wait (in milliseconds)
     */
    async waitForClickable(element, timeout = 10000) {
        try {
            console.log('Waiting for element to be clickable...');
            // Wait for the element to be clickable (visible and enabled)
            await element.waitForClickable({ timeout });
            console.log('Element is now clickable!');
        } catch (error) {
            console.log('ERROR: Element was not clickable within the timeout');
            // Taking a screenshot can help us debug if elements aren't clickable
            await browser.takeScreenshot();
            throw error;
        }
    }
    
    /**
     * Clicks on an element
     * @param {Object} element - The WebdriverIO element to click
     */
    async click(element) {
        try {
            // First make sure the element is clickable before trying to click it
            console.log('Preparing to click an element');
            await this.waitForClickable(element);
            
            // Now we can click it safely
            await element.click();
            console.log('Successfully clicked the element');
            
            // Adding a small pause after clicking can help with page transitions
            await browser.pause(500);
        } catch (error) {
            // Sometimes elements aren't clickable right away, so we can try again
            console.log('ERROR: Failed to click element, trying again after a pause');
            await browser.pause(2000);
            
            try {
                await element.click();
                console.log('Click successful on second attempt');
            } catch (secondError) {
                console.log('ERROR: Failed to click element even after waiting');
                await browser.takeScreenshot();
                throw secondError;
            }
        }
    }
    
    /**
     * Types text into an input field
     * @param {Object} element - The WebdriverIO element
     * @param {String} value - The text to type
     */
    async setValue(element, value) {
        try {
            console.log(`Setting value: "${value}"`);
            // Make sure the element is visible first
            await element.waitForDisplayed();
            
            // Clear any existing text
            await element.clearValue();
            console.log('Cleared existing value');
            
            // Type the new text
            await element.setValue(value);
            console.log('New value set successfully');
            
            // Small pause to make sure the value is fully set
            await browser.pause(500);
        } catch (error) {
            console.log(`ERROR: Failed to set value "${value}"`);
            await browser.takeScreenshot();
            throw error;
        }
    }
    
    /**
     * Gets text from an element
     * @param {Object} element - The WebdriverIO element
     * @returns {String} - The text content of the element
     */
    async getText(element) {
        try {
            console.log('Getting text from element');
            // Make sure the element is visible first
            await element.waitForDisplayed();
            
            // Get the text
            const text = await element.getText();
            console.log(`Got text: "${text}"`);
            return text;
        } catch (error) {
            console.log('ERROR: Failed to get text from element');
            await browser.takeScreenshot();
            throw error;
        }
    }
    
    /**
     * Checks if an element exists on the page
     * @param {Object} element - The WebdriverIO element
     * @returns {Boolean} - True if element exists, false otherwise
     */
    async exists(element) {
        try {
            console.log('Checking if element exists');
            const exists = await element.isExisting();
            console.log(`Element exists: ${exists}`);
            return exists;
        } catch (error) {
            console.log('Element does not exist');
            return false;
        }
    }
    
    /**
     * Waits for page to finish loading
     * @param {Number} timeout - Maximum time to wait in milliseconds
     */
    async waitForPageToLoad(timeout = 10000) {
        console.log('Waiting for page to load completely...');
        await browser.waitUntil(
            async () => {
                const state = await browser.execute(() => document.readyState);
                console.log(`Current page state: ${state}`);
                return state === 'complete';
            },
            {
                timeout,
                timeoutMsg: 'Page did not finish loading in time'
            }
        );
        console.log('Page loaded successfully!');
        await browser.pause(1000); // Extra pause for any JavaScript to finish
    }
}

// Export the Page class so other files can use it
module.exports = Page;

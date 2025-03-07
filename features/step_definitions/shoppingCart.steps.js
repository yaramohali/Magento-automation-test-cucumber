const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');

// Import our page objects so we can use them in our steps
const homePage = require('../../src/pageObjects/HomePage');
const productPage = require('../../src/pageObjects/ProductPage');
const cartPage = require('../../src/pageObjects/CartPage');

// Helper function to check if browser session is still valid
async function isBrowserValid() {
    try {
        // Try a simple browser command to check if the session is valid
        await browser.getTitle();
        return true;
    } catch (error) {
        console.log('Browser session is not valid:', error.message);
        return false;
    }
}

// Helper function to recover browser if it crashed
async function recoverBrowser() {
    console.log('Attempting to recover browser session...');
    try {
        // Try to create a new browser session
        await browser.reloadSession();
        console.log('Browser session recovered successfully');
        
        // Navigate to homepage to start fresh
        await homePage.open();
        await browser.pause(3000);
        return true;
    } catch (error) {
        console.log('Failed to recover browser session:', error.message);
        return false;
    }
}

// Helper function to stabilize tests with better error handling and recovery
async function safeAction(actionName, action, maxRetries = 3) {
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
        try {
            // Check if browser is still valid before attempting action
            if (!(await isBrowserValid())) {
                console.log(`Browser invalid before ${actionName}, attempting recovery...`);
                const recovered = await recoverBrowser();
                if (!recovered) {
                    throw new Error(`Cannot recover browser to perform ${actionName}`);
                }
            }
            
            console.log(`Starting action: ${actionName} (attempt ${retryCount + 1}/${maxRetries})`);
            const result = await action();
            console.log(`Completed action: ${actionName}`);
            return result;
        } catch (error) {
            retryCount++;
            console.log(`Error during ${actionName} (attempt ${retryCount}/${maxRetries}): ${error.message}`);
            
            // Take a screenshot to help with debugging (if browser is still valid)
            try {
                if (await isBrowserValid()) {
                    await browser.saveScreenshot(`./error-${actionName.replace(/\s+/g, '-')}-attempt-${retryCount}.png`);
                    await browser.pause(2000); // Pause to stabilize
                }
            } catch (e) {
                console.log('Could not take error screenshot', e.message);
            }
            
            // If this is the last retry, throw the error
            if (retryCount >= maxRetries) {
                console.log(`Failed ${actionName} after ${maxRetries} attempts`);
                throw error;
            }
            
            // Otherwise wait before retry
            console.log(`Waiting before retry attempt ${retryCount + 1}...`);
            await browser.pause(3000 * retryCount); // Increasing pause between retries
            
            // Try to recover the browser if needed
            if (!(await isBrowserValid())) {
                await recoverBrowser();
            }
        }
    }
}

// Step for navigating to the cart page
Given('I am on the shopping cart page', async () => {
    await safeAction('open cart page', async () => {
        // Open the cart page directly
        console.log('Opening the shopping cart page');
        await cartPage.open();
        
        // Give page time to fully load
        await browser.pause(3000);
    });
});

// Click on the first product we find
When('I click on the first product in the search results', async () => {
    await safeAction('click first product', async () => {
        console.log('Clicking on the first product in search results');
        const productItems = await browser.$$('.product-items .product-item');
        
        // Make sure we found at least one product
        if (productItems.length === 0) {
            throw new Error('No products found in search results');
        }
        
        // Click on the first product's link
        const link = await productItems[0].$('.product-item-link');
        await link.waitForClickable({ timeout: 10000 });
        await link.click();
        
        // Wait for the product page to load
        await browser.pause(3000);
    });
});

// Add the current product to the cart
When('I add the product to my cart', async () => {
    await safeAction('add product to cart', async () => {
        console.log('Adding product to cart');
        
        // Wait for product page to fully load
        await browser.pause(3000);
        
        // Add the product to cart with default options
        const isSuccessful = await productPage.addToCart({
            size: 'M', // Select a default size
            color: 'Black' // Select a default color
        });
        
        // Make sure the product was added successfully
        expect(isSuccessful, 'Product was not added to cart successfully').to.be.true;
    });
});

// Check that we have something in our cart
Then('I should have items in my shopping cart', async () => {
    await safeAction('check cart has items', async () => {
        console.log('Checking if shopping cart has items');
        
        // Open the cart page
        await cartPage.open();
        
        // Wait for cart to load
        await browser.pause(3000);
        
        // Get the number of items in the cart
        const numberOfItems = await cartPage.getNumberOfItems();
        console.log(`Found ${numberOfItems} items in cart`);
        
        // Make sure the cart is not empty
        expect(numberOfItems).to.be.greaterThan(0, 'Shopping cart is empty');
    });
});

// This step adds a product to the cart via search
Given('I have a product in my shopping cart', async () => {
    await safeAction('add product to cart for scenario', async () => {
        // More robust shopping cart population with retries
        let cartHasItems = false;
        let attemptCount = 0;
        const maxAttempts = 2; // Reduced attempts since safeAction already has retries
        
        // First check if the cart already has items
        await cartPage.open();
        await browser.pause(3000);
        cartHasItems = !(await cartPage.isCartEmpty());
        
        // If cart is already populated, we can skip ahead
        if (cartHasItems) {
            console.log('Cart already has items, skipping adding products');
            return;
        }
        
        console.log('Cart is empty, will add a product');
        
        // We'll try a few times in case of any issues
        while (!cartHasItems && attemptCount < maxAttempts) {
            attemptCount++;
            console.log(`Attempt ${attemptCount} of ${maxAttempts} to add product to cart`);
            
            // Start from the home page
            await homePage.open();
            await browser.pause(2000);
            
            // Search for pants (they usually have size and color options)
            await homePage.searchProduct('pants');
            await browser.pause(3000);
            
            // Click on the first product in the results
            const searchResults = await homePage.getSearchResults();
            console.log(`Found ${searchResults.length} search results`);
            
            if (searchResults.length === 0) {
                console.log('No search results found, trying a different search term');
                continue; // Try again with different search term?
            }
            
            // Click on the first product
            await searchResults[0].waitForClickable({ timeout: 10000 });
            await searchResults[0].click();
            await browser.pause(5000); // Wait longer for product page to load
            
            // Add to cart with some options
            console.log('Attempting to add product to cart with size M and color Black');
            const isSuccessful = await productPage.addToCart({
                size: 'M',
                color: 'Black',
                quantity: 1
            });
            
            // Check if the success message is displayed
            if (isSuccessful) {
                console.log('Product added to cart successfully!');
                cartHasItems = true;
                
                // Go to the cart to verify
                await cartPage.open();
                await browser.pause(3000);
                const itemCount = await cartPage.getNumberOfItems();
                console.log(`Verified ${itemCount} items in cart`);
            } else {
                console.log('Failed to add product to cart, will retry');
            }
        }
        
        // Make sure we were able to add an item
        expect(cartHasItems, 'Failed to add product to cart after multiple attempts').to.be.true;
    }, 3); // Pass max retries parameter to safeAction
});

// Step to check the number of items in the cart
Then('I should see {int} item(s) in my shopping cart', async (expectedCount) => {
    await safeAction(`check for ${expectedCount} items in cart`, async () => {
        console.log(`Expecting to see ${expectedCount} items in the cart`);
        
        // Make sure cart page is loaded
        await cartPage.open();
        await browser.pause(3000);
        
        // Check how many items are actually in the cart
        const actualCount = await cartPage.getNumberOfItems();
        console.log(`Actual items in cart: ${actualCount}`);
        
        // Compare actual count with what we expect
        expect(actualCount).to.equal(expectedCount);
    });
});

// Update the product quantity
When('I update the product quantity to {int}', async (quantity) => {
    await safeAction(`update quantity to ${quantity}`, async () => {
        console.log(`Updating product quantity to ${quantity}`);
        
        // Wait for cart to load fully
        await browser.pause(2000);
        
        // Get all items in the cart
        const items = await cartPage.cartItems;
        
        // Make sure we have at least one item
        if (items.length === 0) {
            throw new Error('Cannot update quantity - no items in cart');
        }
        
        // Get the name of the first product
        const nameElement = await items[0].$('.product-item-name a');
        await nameElement.waitForExist({ timeout: 10000 });
        const productName = await nameElement.getText();
        
        // Update the quantity
        await cartPage.updateItemQuantity(productName, quantity);
        
        // Wait for cart to update
        await browser.pause(3000);
    });
});

// Step to update the quantity of a specific item in the cart
When('I update the quantity of {string} to {int}', async (productName, quantity) => {
    await safeAction(`update quantity of ${productName} to ${quantity}`, async () => {
        console.log(`Updating quantity of "${productName}" to ${quantity}`);
        
        // Update the quantity of the specified product
        const updated = await cartPage.updateItemQuantity(productName, quantity);
        
        // Give the page time to update
        await browser.pause(3000);
        
        // Check if the update was successful
        expect(updated, `Failed to update quantity of ${productName}`).to.be.true;
    });
});

// Step to remove an item from the cart
When('I remove {string} from my shopping cart', async (productName) => {
    await safeAction(`remove ${productName} from cart`, async () => {
        console.log(`Removing "${productName}" from cart`);
        
        // Get all product names in cart first for better matching
        const itemNames = await cartPage.getCartItemNames();
        console.log(`Current items in cart: ${itemNames.join(", ")}`);
        
        // Find the closest matching product name
        let closestMatch = "";
        for (const name of itemNames) {
            if (name.toLowerCase().includes(productName.toLowerCase()) || 
                productName.toLowerCase().includes(name.toLowerCase())) {
                closestMatch = name;
                console.log(`Found matching product "${closestMatch}" for search term "${productName}"`);
                break;
            }
        }
        
        // If we found a match, use that exact name for removal
        if (closestMatch) {
            console.log(`Using exact product name "${closestMatch}" for removal`);
            
            // Remove the product
            const removed = await cartPage.removeItemByName(closestMatch);
            
            // Give the page time to update
            await browser.pause(5000);
            
            // Check if the removal was successful by verifying the product is no longer in the cart
            const stillInCart = await cartPage.isProductInCart(closestMatch);
            expect(stillInCart, `Product ${closestMatch} is still in the cart`).to.be.false;
        } else {
            console.log(`Could not find a matching product for "${productName}"`);
            throw new Error(`No matching product found for "${productName}"`);
        }
    }, 3); // Allow up to 3 retries
});

// Step to check if an item is in the cart
Then('I should see {string} in my shopping cart', async (productName) => {
    await safeAction(`check if ${productName} is in cart`, async () => {
        console.log(`Checking if "${productName}" is in the cart`);
        
        // Check if the specified product is in the cart
        const isInCart = await cartPage.isProductInCart(productName);
        
        // Check if the product was found
        expect(isInCart, `${productName} is not in the cart`).to.be.true;
    });
});

// Step to check if the cart is empty
Then('my shopping cart should be empty', async () => {
    await safeAction('check if cart is empty', async () => {
        console.log('Checking if cart is empty');
        
        // Check if the cart is empty
        const isEmpty = await cartPage.isCartEmpty();
        
        // The cart should be empty
        expect(isEmpty, 'Shopping cart is not empty').to.be.true;
    });
});

// Step to proceed to checkout
When('I proceed to checkout', async () => {
    await safeAction('proceed to checkout', async () => {
        console.log('Proceeding to checkout');
        
        // Click the checkout button
        await cartPage.proceedToCheckout();
        
        // Wait for the checkout page to load
        await browser.pause(3000);
    });
});

// Step to remove any product from the cart (without specifying a name)
When('I remove the product from my shopping cart', async () => {
    await safeAction('remove product from cart', async () => {
        console.log('Removing any product from cart');
        
        // Check if we have items in the cart before removal
        const itemNames = await cartPage.getCartItemNames();
        console.log(`Items in cart before removal: ${itemNames.join(', ')}`);
        
        // If no items, we can't remove anything
        if (itemNames.length === 0) {
            console.log('No items in cart to remove');
            throw new Error('No items in cart to remove');
        }
        
        // Remove the first product found in the cart
        const firstProductName = itemNames[0];
        console.log(`Removing first product: ${firstProductName}`);
        const removed = await cartPage.removeItemByName(firstProductName);
        
        // Give the page time to update
        await browser.pause(5000);
        
        // Check if the cart is now empty or has fewer items
        const updatedItemNames = await cartPage.getCartItemNames();
        console.log(`Items in cart after removal: ${updatedItemNames.join(', ')}`);
        
        if (updatedItemNames.length < itemNames.length) {
            console.log('Successfully removed an item from cart');
        } else {
            console.log('Failed to remove an item from cart');
            throw new Error('Failed to remove an item from cart');
        }
    }, 3); // Allow up to 3 retries
});

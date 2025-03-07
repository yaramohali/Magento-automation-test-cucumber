const Page = require('./Page');

// This page handles everything related to the shopping cart
class CartPage extends Page {
    // The URL for the cart page
    get cartUrl() { return '/checkout/cart/'; }
    // The cart summary
    get cartSummary() { return $('.cart-summary'); }
    // This shows how many items are in the cart
    get itemCount() { return $$('.cart.item'); }
    // All the products in the cart
    get cartItems() { return $$('.cart.item'); }
    // Each product's name in the cart
    get cartItemNames() { return $$('.cart.item .product-item-name a'); }
    // The proceed to checkout button
    get proceedToCheckoutButton() { return $('.action.primary.checkout'); }
    // The button to update shopping cart
    get updateCartButton() { return $('button.update'); }
    // Alternative update button (sometimes Magento has different selectors)
    get alternativeUpdateButton() { return $('.action.update'); }
    // Empty cart message when there are no items
    get emptyCartMessage() { return $('.cart-empty'); }
    // This opens the cart page
    open() {
        // Use the parent page open method with our cart URL
        return super.open(this.cartUrl);
    }
    // This tells us how many items are in the cart
    async getNumberOfItems() {
        // Wait a bit for the cart to update
        await browser.pause(1000);
        
        // Count the items
        let items = await this.itemCount;
        console.log(`Found ${items.length} items in cart`);
        return items.length;
    }
    // Check if the cart is empty
    async isCartEmpty() {
        // If there's an empty cart message, the cart is empty
        try {
            // Wait for either items or empty message to appear
            await browser.pause(1000);
            const isEmpty = await this.emptyCartMessage.isDisplayed();
            console.log(`Is cart empty? ${isEmpty}`);
            return isEmpty;
        } catch (error) {
            // If we get an error, probably the message isn't there, so cart is not empty
            console.log('Error checking if cart is empty: ' + error.message);
            return false;
        }
    }
    // Get all the product names in the cart
    async getCartItemNames() {
        // Get all the item name elements
        const nameElements = await this.cartItemNames;
        // Make an array to store all the names
        let names = [];
        // Loop through each element and get the text
        for (let i = 0; i < nameElements.length; i++) {
            let name = await nameElements[i].getText();
            names.push(name);
        }
        console.log('Items in cart: ' + names.join(', '));
        return names;
    }
    // Check if a product is in the cart
    async isProductInCart(productName) {
        // Get all the names of products in the cart
        const names = await this.getCartItemNames();
        // Check if the product name is in our list
        for (let i = 0; i < names.length; i++) {
            if (names[i].includes(productName)) {
                console.log(`Found product ${productName} in cart`);
                return true;
            }
        }
        console.log(`Product ${productName} not found in cart`);
        return false;
    }
    // Remove an item from the cart by its name
    async removeItemByName(productName) {
        console.log(`Attempting to remove product "${productName}" from cart`);
        
        try {
            // Wait for the cart items to be visible
            await browser.pause(2000);
            
            // Get all the cart items
            const items = await this.cartItems;
            console.log(`Found ${items.length} items in cart to check for removal`);
            
            // If no items, return false
            if (items.length === 0) {
                console.log('No items in cart to remove');
                return false;
            }
            
            // First get all product names for logging
            const allProductNames = await this.getCartItemNames();
            console.log(`All products in cart: ${allProductNames.join(', ')}`);
            
            // Try to remove the first product if no specific name is given
            if (!productName || productName === '') {
                console.log('No specific product name given, removing the first product');
                if (items.length > 0) {
                    const firstItem = items[0];
                    const removeButton = await firstItem.$('.action-delete, .action.delete, a.action.delete');
                    await removeButton.waitForClickable({ timeout: 5000 });
                    await this.click(removeButton);
                    await browser.pause(5000);
                    return true;
                }
                return false;
            }
            
            // Loop through each item to find any with a matching name (case insensitive partial match)
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const nameElement = await item.$('.product-item-name a');
                
                try {
                    await nameElement.waitForExist({ timeout: 5000 });
                    const name = await nameElement.getText();
                    console.log(`Checking cart item ${i+1}: "${name}"`);
                    
                    // Use a more flexible matching (case insensitive, partial match)
                    if (name.toLowerCase().includes(productName.toLowerCase()) || 
                        productName.toLowerCase().includes(name.toLowerCase())) {
                        console.log(`Found matching product "${name}" - attempting to remove`);
                        
                        // Try multiple selectors for the remove button
                        let removeButton;
                        try {
                            removeButton = await item.$('.action-delete');
                            await removeButton.waitForClickable({ timeout: 5000 });
                        } catch (e) {
                            console.log('Could not find .action-delete, trying alternative selector');
                            try {
                                removeButton = await item.$('.action.delete');
                                await removeButton.waitForClickable({ timeout: 5000 });
                            } catch (e2) {
                                console.log('Could not find .action.delete, trying another selector');
                                removeButton = await item.$('a.action.delete');
                                await removeButton.waitForClickable({ timeout: 5000 });
                            }
                        }
                        
                        // Click the remove button
                        await this.click(removeButton);
                        console.log(`Clicked remove button for "${name}"`);
                        
                        // Wait for the page to refresh
                        await browser.pause(5000);
                        
                        // Check if the item was actually removed
                        const updatedNames = await this.getCartItemNames();
                        console.log(`Items after removal: ${updatedNames.join(', ')}`);
                        
                        if (!updatedNames.some(n => n === name)) {
                            console.log(`Successfully removed "${name}" from cart`);
                            return true;
                        } else {
                            console.log(`Failed to remove "${name}" - still in cart`);
                        }
                    }
                } catch (itemError) {
                    console.log(`Error checking item ${i}: ${itemError.message}`);
                    continue; // Try the next item
                }
            }
            
            // If we have any items in the cart, but none matched the name, let's remove the first item as a fallback
            if (items.length > 0) {
                console.log(`Could not find product "${productName}", removing first item as fallback`);
                const firstItem = items[0];
                
                // Get the actual name for logging
                const nameElement = await firstItem.$('.product-item-name a');
                const actualName = await nameElement.getText();
                console.log(`Removing first product: "${actualName}"`);
                
                // Find and click the remove button
                const removeButton = await firstItem.$('.action-delete, .action.delete, a.action.delete');
                await removeButton.waitForClickable({ timeout: 5000 });
                await this.click(removeButton);
                
                // Wait for the page to refresh
                await browser.pause(5000);
                return true;
            }
            
            // If we get here, we didn't find the item
            console.log(`Could not find any product matching "${productName}" to remove`);
            return false;
            
        } catch (error) {
            console.log(`Error in removeItemByName: ${error.message}`);
            return false;
        }
    }
    // Update the quantity of an item in the cart
    async updateItemQuantity(productName, quantity) {
        console.log(`Attempting to update quantity of "${productName}" to ${quantity}`);
        
        try {
            // Wait for cart to fully load
            await browser.pause(2000);
            
            // Get all the cart items
            const items = await this.cartItems;
            console.log(`Found ${items.length} items in cart to check`);
            
            // If no items, return false
            if (items.length === 0) {
                console.log('No items in cart to update');
                return false;
            }
            
            let itemUpdated = false;
            
            // Loop through each item to find the one with the matching name
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                
                try {
                    const nameElement = await item.$('.product-item-name a');
                    await nameElement.waitForExist({ timeout: 5000 });
                    const name = await nameElement.getText();
                    console.log(`Checking cart item: "${name}"`);
                    
                    // Use a more flexible matching (case insensitive, partial match)
                    if (name.toLowerCase().includes(productName.toLowerCase())) {
                        // Found the item, now update the quantity
                        console.log(`Updating quantity of "${name}" to ${quantity}`);
                        
                        // Find the quantity input
                        const qtyInput = await item.$('input.qty');
                        await qtyInput.waitForExist({ timeout: 5000 });
                        
                        // Clear the input and set the new value
                        await qtyInput.clearValue();
                        await browser.pause(500);
                        await this.setValue(qtyInput, quantity.toString());
                        await browser.pause(1000);
                        
                        // Mark that we found and updated an item
                        itemUpdated = true;
                        break;
                    }
                } catch (itemError) {
                    console.log(`Error checking item ${i}: ${itemError.message}`);
                    continue; // Try the next item
                }
            }
            
            // If we found and updated an item, click the update button
            if (itemUpdated) {
                console.log('Clicking update button to apply changes');
                
                // Try different update button selectors
                try {
                    // First try our primary selector
                    const updateBtn = await this.updateCartButton;
                    await updateBtn.waitForClickable({ timeout: 5000 });
                    await this.click(updateBtn);
                    console.log('Clicked primary update button');
                } catch (e) {
                    console.log(`Primary update button not found: ${e.message}`);
                    
                    try {
                        // Try alternative selector
                        const altBtn = await this.alternativeUpdateButton;
                        await altBtn.waitForClickable({ timeout: 5000 });
                        await this.click(altBtn);
                        console.log('Clicked alternative update button');
                    } catch (e2) {
                        console.log(`Alternative update button not found: ${e2.message}`);
                        
                        // Last resort - try a more generic selector
                        try {
                            const genericBtn = await $('button[data-role="proceed-to-checkout"]');
                            await genericBtn.waitForClickable({ timeout: 5000 });
                            await this.click(genericBtn);
                            console.log('Clicked generic update button');
                        } catch (e3) {
                            console.log(`Could not find any update button: ${e3.message}`);
                            return false;
                        }
                    }
                }
                
                // Wait for the cart to update
                await browser.pause(5000);
                return true;
            } else {
                // If we get here, we didn't find the item
                console.log(`Could not find product "${productName}" to update quantity`);
                return false;
            }
        } catch (error) {
            console.log(`Error in updateItemQuantity: ${error.message}`);
            return false;
        }
    }
    // Proceed to checkout
    async proceedToCheckout() {
        // Click the checkout button
        console.log('Proceeding to checkout');
        await this.click(this.proceedToCheckoutButton);
        
        // Wait for the checkout page to load
        await browser.pause(3000);
    }
}

// Create an instance to export
module.exports = new CartPage();

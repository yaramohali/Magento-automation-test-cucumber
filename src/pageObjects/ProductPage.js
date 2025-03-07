const Page = require('./Page');

// This is the page for product details
class ProductPage extends Page {
    // Elements on the page
    get productTitle() { return $('.page-title-wrapper .page-title span'); }
    get productPrice() { return $('.product-info-price .price-wrapper .price'); }
    get productDescription() { return $('.product.attribute.description .value'); }
    get addToCartButton() { return $('#product-addtocart-button'); }
    // These are for selecting different sizes
    get sizeOptions() { return $$('.swatch-attribute.size .swatch-option'); }
    // These are for selecting different colors
    get colorOptions() { return $$('.swatch-attribute.color .swatch-option'); }
    // This is where you type how many items you want
    get quantityInput() { return $('#qty'); }
    // These are for other actions you can do with a product
    get addToWishlistButton() { return $('.action.towishlist'); }
    get addToCompareButton() { return $('.action.tocompare'); }
    // Success message that shows when you add something to cart
    // Updated to work with Magento test site
    get successMessage() { return $('.messages .message-success, .page.messages .message-success'); }
    // Get the product title
    async getProductTitle() {
        // Wait a bit just to be safe
        await browser.pause(500);
        return await this.getText(this.productTitle);
    }
    // Get the product price
    async getProductPrice() {
        const priceText = await this.getText(this.productPrice);
        console.log("Product price: " + priceText);
        return priceText;
    }
    // Select a size by name (S, M, L, XL, etc.)
    async selectSize(sizeName) {
        console.log("Selecting size: " + sizeName);
        
        try {
            // Wait for size options to be available
            await browser.pause(1000);
            const sizeElements = await this.sizeOptions;  
            // If no size options, log and return (some products don't have sizes)
            if (sizeElements.length === 0) {
                console.log("No size options available for this product");
                return;
            }   
            // Find the right size button to click
            let sizeFound = false;
            for (let i = 0; i < sizeElements.length; i++) {
                const element = sizeElements[i];
                const text = await element.getText();
                
                // Check if this is the size we want
                if (text === sizeName || text.toLowerCase() === sizeName.toLowerCase()) {
                    await this.click(element);
                    console.log(`Size ${sizeName} selected successfully`);
                    sizeFound = true;
                    return;
                }
            }
            
            // If we didn't find the exact size, just pick the first one
            if (!sizeFound && sizeElements.length > 0) {
                console.log(`Size ${sizeName} not found, selecting first available size instead`);
                await this.click(sizeElements[0]);
            }
        } catch (error) {
            console.log(`Error selecting size: ${error.message}`);
            console.log("Continuing without selecting size");
        }
    }

    // Select a color by name (Black, Blue, etc.)
    async selectColor(colorName) {
        console.log("Selecting color: " + colorName);
        
        try {
            // Wait for color options to be available
            await browser.pause(1000);
            const colorElements = await this.colorOptions;
            
            // If no color options, log and return (some products don't have colors)
            if (colorElements.length === 0) {
                console.log("No color options available for this product");
                return;
            }
            
            // Find the right color button to click
            let colorFound = false;
            for (let i = 0; i < colorElements.length; i++) {
                const element = colorElements[i];
                
                // Try multiple attributes that might contain color information
                const title = await element.getAttribute('title') || '';
                const optionId = await element.getAttribute('option-id') || '';
                const optionLabel = await element.getAttribute('option-label') || '';
                const ariaLabel = await element.getAttribute('aria-label') || '';
                
                console.log(`Found color option: Title="${title}", Label="${optionLabel}", ID="${optionId}"`);
                
                // Check if any of the attributes match the color we want
                if (
                    title.toLowerCase() === colorName.toLowerCase() ||
                    optionLabel.toLowerCase() === colorName.toLowerCase() ||
                    ariaLabel.toLowerCase() === colorName.toLowerCase()
                ) {
                    await this.click(element);
                    console.log(`Color ${colorName} selected successfully`);
                    colorFound = true;
                    return;
                }
            }
            
            // If we didn't find the exact color, just pick the first one
            if (!colorFound && colorElements.length > 0) {
                console.log(`Color ${colorName} not found, selecting first available color instead`);
                await this.click(colorElements[0]);
            }
        } catch (error) {
            console.log(`Error selecting color: ${error.message}`);
            console.log("Continuing without selecting color");
        }
    }

    // Set the quantity of the product
    async setQuantity(quantity) {
        console.log("Setting quantity to: " + quantity);
        
        try {
            const qtyInput = await this.quantityInput;
            await qtyInput.clearValue();
            await qtyInput.setValue(quantity);
            console.log("Quantity set successfully");
        } catch (error) {
            console.log(`Error setting quantity: ${error.message}`);
            console.log("Continuing with default quantity");
        }
    }

    // Add the current product to the cart
    // Can specify options like { size: 'M', color: 'Black', quantity: 2 }
    async addToCart(options = {}) {
        console.log("Adding product to cart with options:", options);
        
        try {
            // First, let's try to get the product title for logging
            let productTitle = "unknown product";
            try {
                productTitle = await this.getProductTitle();
                console.log(`Adding product to cart: ${productTitle}`);
            } catch (e) {
                console.log("Could not get product title, continuing anyway");
            }
            
            // Check if we have size options and select one
            let hasSizeOptions = false;
            try {
                const sizeElements = await this.sizeOptions;
                hasSizeOptions = sizeElements.length > 0;
                console.log(`Product has size options: ${hasSizeOptions}`);
                
                if (hasSizeOptions) {
                    // Select size if specified, otherwise select first available
                    if (options.size) {
                        await this.selectSize(options.size);
                    } else {
                        console.log("No size specified, selecting first available size");
                        await this.click(sizeElements[0]);
                    }
                    // Wait after selection
                    await browser.pause(1000);
                }
            } catch (e) {
                console.log(`Error checking size options: ${e.message}`);
            }
            
            // Check if we have color options and select one
            let hasColorOptions = false;
            try {
                const colorElements = await this.colorOptions;
                hasColorOptions = colorElements.length > 0;
                console.log(`Product has color options: ${hasColorOptions}`);
                
                if (hasColorOptions) {
                    // Select color if specified, otherwise select first available
                    if (options.color) {
                        await this.selectColor(options.color);
                    } else {
                        console.log("No color specified, selecting first available color");
                        await this.click(colorElements[0]);
                    }
                    // Wait after selection
                    await browser.pause(1000);
                }
            } catch (e) {
                console.log(`Error checking color options: ${e.message}`);
            }
            
            // Check if both required options were selected
            if ((hasSizeOptions || hasColorOptions) && !hasSizeOptions && !hasColorOptions) {
                console.log("Warning: Product may require selections that weren't made");
            }
            
            // Set quantity if specified
            if (options.quantity && options.quantity > 1) {
                await this.setQuantity(options.quantity);
                // Wait after setting quantity
                await browser.pause(500);
            }
            
            // Click the "Add to Cart" button (with retry logic)
            let clickSuccess = false;
            const maxAttempts = 3;
            
            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                try {
                    console.log(`Attempting to click "Add to Cart" button (attempt ${attempt}/${maxAttempts})`);
                    const addToCartBtn = await this.addToCartButton;
                    
                    // Make sure button is visible and enabled
                    console.log("Checking if Add to Cart button is clickable");
                    const isClickable = await addToCartBtn.isClickable();
                    
                    if (isClickable) {
                        console.log("Button is clickable, clicking now");
                        await this.click(addToCartBtn);
                        clickSuccess = true;
                        break;
                    } else {
                        console.log("Button is not clickable yet, waiting...");
                        await browser.pause(2000); // Wait a bit longer
                    }
                } catch (error) {
                    console.log(`Error clicking Add to Cart button: ${error.message}`);
                    await browser.pause(1000); // Wait before retrying
                }
            }
            
            if (!clickSuccess) {
                console.log("Failed to click Add to Cart button after multiple attempts");
                return false;
            }
            
            // Wait for success message with longer timeout
            console.log("Waiting for success message to appear...");
            await browser.pause(5000); // Give it plenty of time
            
            // Check if success message is displayed
            return await this.isSuccessMessageDisplayed();
            
        } catch (error) {
            console.log(`Error in addToCart method: ${error.message}`);
            // Take a screenshot to help with debugging
            await browser.saveScreenshot('./error-add-to-cart.png');
            return false;
        }
    }

    // Check if success message is displayed after adding to cart
    async isSuccessMessageDisplayed() {
        try {
            // Try multiple strategies to find the success message
            console.log("Checking for success message after adding to cart");
            
            // First strategy: Check for direct success message
            const successMsg = await this.successMessage;
            
            if (await successMsg.isExisting()) {
                const messageText = await successMsg.getText();
                console.log(`Success message found: "${messageText}"`);
                return true;
            }
            
            // Second strategy: Check for other indicators
            // Sometimes Magento doesn't show a success message but updates the cart counter
            const cartCounter = await $('.counter-number');
            if (await cartCounter.isExisting()) {
                const count = await cartCounter.getText();
                if (parseInt(count) > 0) {
                    console.log(`Cart counter shows ${count} items, product was likely added successfully`);
                    return true;
                }
            }
            
            console.log("No success message or cart update found");
            return false;
        } catch (error) {
            console.log(`Error checking success message: ${error.message}`);
            return false;
        }
    }

    // Add the product to wish list
    async addToWishlist() {
        console.log("Adding product to wishlist");
        await this.click(this.addToWishlistButton);
    }

    // Compare this product with others
    async addToCompare() {
        console.log("Adding product to compare list");
        await this.click(this.addToCompareButton);
    }
}

// Export an instance of the class (not the class itself)
// This is how beginners often export - creating an instance right away
module.exports = new ProductPage();

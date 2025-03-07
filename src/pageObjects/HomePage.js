const Page = require('./Page');

// This is the Home Page class for the Magento website
// It handles all the actions we can do on the home page
class HomePage extends Page {    
    // Search box at top of page
    get searchInput() { return $('#search'); }
    // This is the search button next to search box
    get searchButton() { return $('.action.search'); }
    // These are all the products shown in search results
    get searchResults() { return $$('.product-items .product-item'); }
    // This is the title of the page
    get pageTitle() { return $('.page-title-wrapper h1.page-title'); }
    // Open the home page
    open() {
        // I'm using an empty string here because we want the main page
        return super.open('');
    }
    // Search for a product 
    async searchProduct(searchTerm) {
        // First clear the search field and type in the search term
        console.log("Searching for: " + searchTerm);
        await this.searchInput.clearValue();
        await this.searchInput.setValue(searchTerm);
        // Now click the search button
        await this.searchButton.click();
        
        // Let's wait a bit for the results to load
        await browser.pause(2000);
    }
    // Get search results
    async getSearchResults() {
        // Wait for the results to be visible
        await browser.pause(1000); // Extra pause just to be sure
        // Check if any results are found
        const results = await this.searchResults;
        console.log("Found " + results.length + " products");
        return results;
    }
    // Check if a specific product exists in search results
    async productExists(productName) {
        // Get all the products
        const products = await this.getSearchResults();
        
        // Loop through each product and check if the name matches
        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            const name = await product.$('.product-item-name').getText();
            
            if (name.includes(productName)) {
                return true;
            }
        }
        // If we get here, no product was found
        return false;
    }
}
module.exports = new HomePage();

// This file contains data we use for testing
// It helps us create random information like emails and phone numbers

// TestData class with helpful methods for our tests
class TestData {
    // Create a random string with letters and numbers
    // We use this for usernames, etc.
    static generateRandomString(length = 8) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        
        // Add random characters one by one
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters.charAt(randomIndex);
        }
        
        return result;
    }

    // Create a random email address
    // Useful for creating test accounts
    static generateRandomEmail() {
        const username = this.generateRandomString(8);
        const domain = this.generateRandomString(5);
        return `${username}@${domain}.com`;
    }

    // Create a random US phone number
    // Format: 10 digits
    static generateRandomPhoneNumber() {
        let result = '';
        
        // Just create 10 random digits
        for (let i = 0; i < 10; i++) {
            result += Math.floor(Math.random() * 10);
        }
        
        // Format it nicely as (XXX) XXX-XXXX
        return `(${result.substring(0, 3)}) ${result.substring(3, 6)}-${result.substring(6, 10)}`;
    }

    // Get test customer information
    // This is useful for filling out checkout forms
    static getTestCustomer() {
        return {
            email: this.generateRandomEmail(),
            address: {
                firstName: 'John',
                lastName: 'Tester',
                street: '123 Test Street',
                city: 'New York',
                regionId: '43', // This is the ID for New York state
                zipCode: '10001',
                countryId: 'US',
                phoneNumber: this.generateRandomPhoneNumber()
            }
        };
    }

    // List of search terms we can use for product searches
    // These are common products that should be found on the Magento site
    static getProductSearchTerms() {
        return [
            'shirt',
            'yoga',
            'jacket',
            'pants',
            'watch',
            'bag'
        ];
    }

    // List of main categories on the Magento site
    // These should match the top menu items
    static getCategories() {
        return [
            'What\'s New',
            'Women',
            'Men',
            'Gear',
            'Training',
            'Sale'
        ];
    }

    // Different options for filtering products
    // These are based on what's available on the Magento site
    static getProductFilterOptions() {
        return {
            // Price ranges for filtering
            prices: [
                '$0.00 - $49.99', 
                '$50.00 - $99.99', 
                '$100.00 - $149.99', 
                '$150.00 - $199.99', 
                '$200.00 and above'
            ],
            
            // Available colors for clothing and accessories
            colors: [
                'Black', 
                'Blue', 
                'Brown', 
                'Gray', 
                'Green', 
                'Orange', 
                'Purple', 
                'Red', 
                'White', 
                'Yellow'
            ],
            
            // Common clothing sizes
            sizes: ['XS', 'S', 'M', 'L', 'XL']
        };
    }
    
    // Helper function to get a random item from an array
    // Useful when we need to select a random option
    static getRandomItemFromArray(array) {
        const randomIndex = Math.floor(Math.random() * array.length);
        return array[randomIndex];
    }
    
    // Get random product details for adding to cart
    // This gives us a random size and color to use
    static getRandomProductOptions() {
        const options = this.getProductFilterOptions();
        
        return {
            size: this.getRandomItemFromArray(options.sizes),
            color: this.getRandomItemFromArray(options.colors),
            quantity: Math.floor(Math.random() * 3) + 1 // Random quantity between 1-3
        };
    }
}

// Export the class so we can use it in our tests
module.exports = TestData;

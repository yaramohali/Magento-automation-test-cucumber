// This file helps us interact with the checkout page
// We need to use the Page class as our base
const Page = require('./Page');

// This is our CheckoutPage class that handles all the checkout page actions
class CheckoutPage extends Page {
    // These are the elements we need to interact with on the checkout page
    // I'm using WebdriverIO's $ function to find elements by CSS selectors
    
    // ----- SHIPPING STEP ELEMENTS -----
    // Title of the checkout page
    get checkoutTitle() { 
        return $('.opc-progress-bar-item._active span'); 
    }
    
    // Email input field for guest checkout
    get emailInput() { 
        return $('#customer-email'); 
    }
    
    // Customer name fields
    get firstNameInput() { 
        return $('input[name="firstname"]'); 
    }
    get lastNameInput() { 
        return $('input[name="lastname"]'); 
    }
    
    // Address fields
    get streetAddressInput() { 
        return $('input[name="street[0]"]'); 
    }
    get cityInput() { 
        return $('input[name="city"]'); 
    }
    get regionSelect() { 
        return $('select[name="region_id"]'); 
    }
    get zipCodeInput() { 
        return $('input[name="postcode"]'); 
    }
    get countrySelect() { 
        return $('select[name="country_id"]'); 
    }
    get phoneNumberInput() { 
        return $('input[name="telephone"]'); 
    }
    
    // Shipping method options - using $$ to get multiple elements
    get shippingMethods() { 
        return $$('.table-checkout-shipping-method tbody tr'); 
    }
    
    // Next button to go to payment step
    get nextButton() { 
        return $('.button.action.continue.primary'); 
    }
    
    // ----- PAYMENT STEP ELEMENTS -----
    // Payment method section
    get paymentMethods() { 
        return $$('.payment-method'); 
    }
    
    // Radio buttons for selecting payment methods
    get paymentMethodRadioButtons() { 
        return $$('.payment-method input[type="radio"]'); 
    }
    
    // Button to place the order
    get placeOrderButton() { 
        return $('.action.primary.checkout'); 
    }
    
    // ----- ORDER CONFIRMATION ELEMENTS -----
    // Title on the order confirmation page
    get orderConfirmationTitle() { 
        return $('.page-title-wrapper .page-title'); 
    }
    
    // Order number that appears after placing an order
    get orderNumber() { 
        return $('.checkout-success .order-number strong'); 
    }
    
    // ----- HELPER METHODS -----
    
    // Fill in the email address field
    async fillEmail(email) {
        console.log(`Filling in email address: ${email}`);
        try {
            await this.setValue(this.emailInput, email);
            console.log('Email filled successfully');
        } catch (error) {
            console.log(`ERROR: Could not fill email: ${error.message}`);
            throw error;
        }
    }

    // Fill in all the shipping address fields
    async fillShippingAddress(address) {
        console.log('Starting to fill shipping address...');
        
        try {
            // Fill in the name fields
            console.log(`Setting first name: ${address.firstName}`);
            await this.setValue(this.firstNameInput, address.firstName);
            
            console.log(`Setting last name: ${address.lastName}`);
            await this.setValue(this.lastNameInput, address.lastName);
            
            // Fill in the address fields
            console.log(`Setting street address: ${address.street}`);
            await this.setValue(this.streetAddressInput, address.street);
            
            console.log(`Setting city: ${address.city}`);
            await this.setValue(this.cityInput, address.city);
            
            // Select the state/region from the dropdown
            console.log(`Selecting region ID: ${address.regionId}`);
            await this.waitForDisplayed(this.regionSelect);
            await browser.pause(1000); // Extra pause to make sure the dropdown is ready
            await this.regionSelect.selectByAttribute('value', address.regionId);
            
            // Fill in zip code
            console.log(`Setting zip/postal code: ${address.zipCode}`);
            await this.setValue(this.zipCodeInput, address.zipCode);
            
            // Select the country from the dropdown
            console.log(`Selecting country ID: ${address.countryId}`);
            await this.waitForDisplayed(this.countrySelect);
            await browser.pause(1000); // Extra pause to make sure the dropdown is ready
            await this.countrySelect.selectByAttribute('value', address.countryId);
            
            // Fill in phone number
            console.log(`Setting phone number: ${address.phoneNumber}`);
            await this.setValue(this.phoneNumberInput, address.phoneNumber);
            
            console.log('All shipping address fields filled successfully');
            await browser.pause(2000); // Extra pause to make sure everything is saved
        } catch (error) {
            console.log(`ERROR filling shipping address: ${error.message}`);
            await browser.takeScreenshot();
            throw error;
        }
    }

    // Select which shipping method to use (like standard shipping or express)
    async selectShippingMethod(index) {
        console.log(`Selecting shipping method at index: ${index}`);
        
        try {
            // Get all the available shipping methods
            const shippingMethodElements = await this.shippingMethods;
            console.log(`Found ${shippingMethodElements.length} shipping methods`);
            
            // Make sure the index is valid
            if (index >= shippingMethodElements.length) {
                const errorMessage = `Shipping method index ${index} is invalid. We only have ${shippingMethodElements.length} methods available.`;
                console.log(`ERROR: ${errorMessage}`);
                throw new Error(errorMessage);
            }
            
            // Find and click the radio button for the selected shipping method
            const radioButton = await shippingMethodElements[index].$('input[type="radio"]');
            console.log('Found the radio button, clicking it...');
            await this.click(radioButton);
            
            console.log('Shipping method selected successfully');
            await browser.pause(2000); // Wait for the page to update
        } catch (error) {
            console.log(`ERROR selecting shipping method: ${error.message}`);
            await browser.takeScreenshot();
            throw error;
        }
    }

    // Go from the shipping step to the payment step
    async goToNextStep() {
        console.log('Clicking Next button to go to payment step...');
        
        try {
            await this.click(this.nextButton);
            console.log('Moved to payment step successfully');
            await browser.pause(3000); // Extra pause to make sure the payment step loads
        } catch (error) {
            console.log(`ERROR going to next step: ${error.message}`);
            await browser.takeScreenshot();
            throw error;
        }
    }

    // Select which payment method to use (like credit card or PayPal)
    async selectPaymentMethod(index) {
        console.log(`Selecting payment method at index: ${index}`);
        
        try {
            // Get all the available payment methods
            const paymentMethodRadios = await this.paymentMethodRadioButtons;
            console.log(`Found ${paymentMethodRadios.length} payment methods`);
            
            // Make sure the index is valid
            if (index >= paymentMethodRadios.length) {
                const errorMessage = `Payment method index ${index} is invalid. We only have ${paymentMethodRadios.length} methods available.`;
                console.log(`ERROR: ${errorMessage}`);
                throw new Error(errorMessage);
            }
            
            // Click the radio button for the selected payment method
            console.log('Clicking the payment method radio button...');
            await this.click(paymentMethodRadios[index]);
            
            console.log('Payment method selected successfully');
            await browser.pause(2000); // Wait for the payment method to be fully selected
        } catch (error) {
            console.log(`ERROR selecting payment method: ${error.message}`);
            await browser.takeScreenshot();
            throw error;
        }
    }

    // Click the button to place the order
    async placeOrder() {
        console.log('Clicking Place Order button...');
        
        try {
            await this.click(this.placeOrderButton);
            console.log('Order placed successfully! Waiting for confirmation page...');
            await browser.pause(5000); // Wait longer for order confirmation page to load
        } catch (error) {
            console.log(`ERROR placing order: ${error.message}`);
            await browser.takeScreenshot();
            throw error;
        }
    }

    // Get the title text from the order confirmation page
    async getOrderConfirmationTitle() {
        console.log('Getting order confirmation title...');
        
        try {
            // Wait longer (15 seconds) for the confirmation page to load
            await this.waitForDisplayed(this.orderConfirmationTitle, 15000);
            const title = await this.getText(this.orderConfirmationTitle);
            console.log(`Order confirmation title: "${title}"`);
            return title;
        } catch (error) {
            console.log('ERROR: Order confirmation title not found. The order might not have been placed successfully.');
            await browser.takeScreenshot();
            throw error;
        }
    }

    // Get the order number from the confirmation page
    async getOrderNumber() {
        console.log('Getting order number...');
        
        try {
            const orderNum = await this.getText(this.orderNumber);
            console.log(`Order number: ${orderNum}`);
            return orderNum;
        } catch (error) {
            console.log(`ERROR getting order number: ${error.message}`);
            await browser.takeScreenshot();
            throw error;
        }
    }

    // A helper function to complete the entire checkout process in one go
    async completeCheckout(customer, shippingMethodIndex = 0, paymentMethodIndex = 0) {
        console.log('Starting complete checkout process...');
        
        try {
            // Step 1: Fill in email address
            console.log('Step 1: Fill in email address');
            await this.fillEmail(customer.email);
            
            // Step 2: Fill in shipping address
            console.log('Step 2: Fill in shipping address');
            await this.fillShippingAddress(customer.address);
            
            // Step 3: Select shipping method
            console.log('Step 3: Select shipping method');
            await this.selectShippingMethod(shippingMethodIndex);
            
            // Step 4: Go to payment step
            console.log('Step 4: Go to payment step');
            await this.goToNextStep();
            
            // Step 5: Select payment method
            console.log('Step 5: Select payment method');
            await this.selectPaymentMethod(paymentMethodIndex);
            
            // Step 6: Place the order
            console.log('Step 6: Place the order');
            await this.placeOrder();
            
            console.log('Checkout process completed successfully!');
        } catch (error) {
            console.log(`ERROR during checkout process: ${error.message}`);
            await browser.takeScreenshot();
            throw error;
        }
    }
}

// Create an instance of the CheckoutPage class and export it
const checkoutPage = new CheckoutPage();
module.exports = checkoutPage;

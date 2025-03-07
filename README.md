# Magento Automated Testing 

This is the automated tests for testing Magento e-commerce websites using WebdriverIO and Cucumber.

## What This Framework Does

This framework helps you test a Magento online store without having to manually click through everything. It uses:
- **WebdriverIO**: Controls the browser automatically
- **Cucumber**: Lets you write tests in plain English
- **JavaScript**: Powers everything behind the scenes

We test the Magento demo site at [https://magento.softwaretestingboard.com](https://magento.softwaretestingboard.com).

## 🚀 Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm (comes with Node.js)
- Google Chrome browser

### Setup Steps
1. **Clone this repository** to your computer
   ```
   git clone <repository-url>
   cd magento-automated-testing
   ```

2. **Install dependencies**
   ```
   npm install
   ```

3. **Run all tests**
   ```
   npm test
   ```

4. **Run specific test features**
   ```
   npx wdio run wdio.conf.js --spec ./features/productSearch.feature  # Run only product search tests
   npx wdio run wdio.conf.js --spec ./features/shoppingCart.feature   # Run only shopping cart tests
   ```


## Allure Test Report 

This project includes Allure Report integration to visualize test execution results. 
Allure Report Features:

   1- Displays passed, failed, and skipped test cases.
   2- Provides execution history.
   3- Shows detailed test logs, screenshots, and duration.

To generate test reports, Run: 

   ```
   npm run report
   ```
   
| Allure Report Overview |
|:---:|
| ![Allure Report Screenshot](https://github.com/user-attachments/assets/d6c6530f-6bce-4e39-b108-66e0288b06fa) |
| *Test Execution Results Dashboard* |
  


## 📂 Framework Structure Explained

```
magento-automated-testing/
├── features/                  # Test scenarios in plain English
│   ├── productSearch.feature  # Product search test scenarios
│   ├── shoppingCart.feature   # Shopping cart test scenarios
│   ├── step_definitions/      # JavaScript code that runs each test step
│   └── support/               # Helper files for the test framework
├── src/
│   ├── pageObjects/           # JavaScript files that interact with web pages
│   │   ├── HomePage.js        # Methods for interacting with the home page
│   │   ├── ProductPage.js     # Methods for interacting with product pages
│   │   ├── CartPage.js        # Methods for interacting with the cart page
│   │   └── Page.js            # Base class with common methods
│   └── utils/                 # Helper functions
│       ├── logger.js          # Helps with printing useful test information
│       └── testData.js        # Provides test data like emails, names, etc.
├── wdio.conf.js               # Main configuration file
├── babel.config.js            # Helps run modern JavaScript code
└── package.json               # Lists all dependencies and scripts
```

## Writing The First Test

Tests are written in two parts:
1. **Feature files** (.feature): Plain English descriptions of what you're testing
2. **Step definition files** (.steps.js): JavaScript code that runs each step

### Example Feature File
```gherkin
Feature: Product Search
  As a customer
  I want to search for products
  So that I can find items I'm interested in

  Scenario: Search for a product by name
    Given I am on the home page
    When I search for "yoga"
    Then I should see search results
    And the search results should contain "yoga" products
```

### Example Step Definition
```javascript
Given('I am on the home page', async function() {
  console.log('Going to the home page');
  await homePage.open();
});

When('I search for {string}', async function(searchTerm) {
  console.log('Searching for: ' + searchTerm);
  await homePage.searchProduct(searchTerm);
});
```

## 🧩 Key Components Explained

### Page Objects
These files contain methods to interact with specific pages. For example:
- `HomePage.js`: Contains methods like `searchProduct()` to search for items
- `ProductPage.js`: Contains methods like `addToCart()` to add products to cart
- `CartPage.js`: Contains methods to manage items in the shopping cart

### Feature Files
These files describe the tests in plain English using Gherkin syntax:
- `Given`: Sets up the initial condition
- `When`: Describes the action taken
- `Then`: Verifies the expected result

## 🔍 Automated Test Cases

This framework currently covers the following critical e-commerce functionality:

### 1. Product Search and Filtering
- Search by product name
- Search with partial keywords
- Verify search results contain expected products

### 2. Shopping Cart Management
- Add products to cart
- Update product quantities 
- Remove products from cart
- Verify multiple products in cart

## 🔧 Troubleshooting Tests

When tests fail, try these approaches:
1. **Check the console output** for error messages
2. **Look at screenshots** taken during test failures (in the `allure-results` folder)
3. **Run tests without headless mode** to see what's happening in the browser
   - Edit `wdio.conf.js` and remove `--headless` from the Chrome options
4. **Increase timeouts** for slow connections
   - Edit `wdio.conf.js` and increase the `waitforTimeout` value

## 🛠️ Common Issues and Solutions

1. **Element not found errors**
   - Websites may change their structure. Check if selectors need updating.
   - Try adding longer waits with `browser.pause(milliseconds)`

2. **Timeout errors**
   - The website might be responding slowly. Try increasing timeouts in `wdio.conf.js`
   - Network issues might cause timeouts. Check your internet connection.

3. **Test data issues**
   - Some tests might fail if they rely on specific data existing on the site
   - Try modifying the test data in `src/utils/testData.js`

4. **Browser session issues**
   - If you get "no such window" errors, the framework includes recovery mechanisms
   - The `safeAction()` helper function in step definitions handles browser recovery

## 📚 Learn More

- [WebdriverIO Documentation](https://webdriver.io/docs/gettingstarted)
- [Cucumber.js Documentation](https://github.com/cucumber/cucumber-js)
- [Page Object Pattern](https://martinfowler.com/bliki/PageObject.html)

## 🤝 Contributing

Feel free to submit issues or pull requests if you find any bugs or have suggestions for improvements.


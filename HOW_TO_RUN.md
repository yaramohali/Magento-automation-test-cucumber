# How to Run the Magento Automated Tests

This document provides step-by-step instructions on how to set up and run the automated tests.

## Prerequisites

Before running the tests, make sure you have the following installed:

- Node.js (version 14 or newer)
- npm (comes with Node.js)
- Chrome browser
- Git (optional, for version control)

## Setup Instructions

1. Clone or download the repository to your local machine.

2. Navigate to the project directory:
   ```bash
   cd magento-automated-testing
   ```

3. Install the dependencies:
   ```bash
   npm install
   ```

4. The framework is pre-configured to test the Magento demo site at:
   ```
   BASE_URL=https://magento.softwaretestingboard.com
   ```
   If you need to test a different Magento site, update the URL in the `.env` file or directly in `wdio.conf.js`.

5. Update the `wdio.conf.js` file to match your test environment:
   - Update the `baseUrl` value if different from the `.env` file
   - Adjust browser capabilities if needed

## Running the Tests

### Running All Tests

To run all tests:

```bash
npm test
```

### Running Specific Tests

To run specific feature files:

```bash
npx wdio run wdio.conf.js --spec ./features/productSearch.feature
```

To run tests with specific tags:

```bash
npx wdio run wdio.conf.js --cucumberOpts.tagExpression='@smoke'
```

## Generating Reports

After running the tests, you can generate an Allure report:

```bash
npm run report
```

This will generate and open the report in your default browser.

## Troubleshooting

1. If you encounter `Error: Cannot find module` errors, make sure all dependencies are installed:
   ```bash
   npm install
   ```

2. If browser tests don't start, ensure you have Chrome installed and the ChromeDriver version is compatible with your Chrome version.

3. For issues with element visibility or timeouts, consider increasing the timeout values in the `.env` file or `wdio.conf.js`.

4. For other issues, check the logs in the `logs` directory for more details.

## Additional Information

- Tests are written using Cucumber with WebdriverIO 8
- Page Object Model design pattern is used for better maintainability
- Allure reporting is implemented for comprehensive test reports
- Screenshots are taken on test failures to aid in debugging

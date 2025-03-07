# This is a feature file for testing the shopping cart functionality
# It describes different scenarios for adding, updating, and removing products from the cart

Feature: Shopping Cart Management
  As a customer
  I want to manage my shopping cart
  So that I can purchase the products I want

  # Basic test to add a product to the cart
  Scenario: Add a product to the shopping cart
    Given I am on the home page
    When I search for "yoga"
    And I click on the first product in the search results
    And I add the product to my cart
    Then I should have items in my shopping cart

  # Test to update the quantity of a product in the cart
  Scenario: Update product quantity in the shopping cart
    Given I have a product in my shopping cart
    When I update the product quantity to 2
    Then I should see 1 item in my shopping cart

  # Test to remove a product from the cart
  Scenario: Remove a product from the shopping cart
    Given I have a product in my shopping cart
    When I remove the product from my shopping cart
    Then my shopping cart should be empty

  # Test to add multiple products to the cart (advanced)
  Scenario: Add multiple products to the shopping cart
    Given I have a product in my shopping cart
    Given I am on the home page
    When I search for "shirt"
    And I click on the first product in the search results
    And I add the product to my cart
    Then I should see 2 items in my shopping cart

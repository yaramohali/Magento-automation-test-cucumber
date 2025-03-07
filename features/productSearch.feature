# This feature file contains tests for the product search functionality
# We want to make sure customers can find products using the search bar

Feature: Product Search
  As a customer
  I want to search for products
  So that I can find items I'm interested in purchasing

  # Basic test to search for yoga products
  Scenario: Search for a product by name
    Given I am on the home page
    When I search for "yoga"
    Then I should see search results
    And the search results should contain "yoga" products

  # It uses an "Examples" table to run the same test with different data
  Scenario Outline: Search for products with different terms
    Given I am on the home page
    When I search for "<searchTerm>"
    Then I should see search results
    And the search results should contain "<searchTerm>" products

    # These are the different search terms we want to test
    Examples:
      | searchTerm |
      | shirt     |
      | jacket    |
      | pants     |

  # This test checks if partial search terms work
  Scenario: Search with partial product name
    Given I am on the home page
    When I search for "jack"
    Then I should see search results
    And the search results should contain "jacket" products

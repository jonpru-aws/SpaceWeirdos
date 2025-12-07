# Implementation Plan: Space Weirdos Data Persistence

- [x] 1. Create data persistence types and interfaces

- [x] 1.1 Define persistence-specific types

  - Create `PersistenceError` class with error codes
  - Define `ValidationResult` and `ValidationError` interfaces
  - Define `WarbandSummary` interface
  - Define `StorageData` interface for JSON file structure
  - _Requirements: 4.1, 4.4, 5.1-5.7, 8.1-8.5_



- [x] 2. Implement DataRepository core structure




- [x] 2.1 Create DataRepository class skeleton


  - Set up class with in-memory cache (Map)
  - Define storage file path constant
  - Implement UUID generation helper
  - Add timestamp helper functions

  - _Requirements: 2.1, 2.4, 7.1, 7.4, 9.5, 9.6_

- [x] 2.2 Implement initialization logic


  - Create `initialize()` method to load data from file
  - Handle directory creation if not exists
  - Handle empty file initialization
  - Load existing warbands into cache
  - _Requirements: 7.1, 8.4_


- [x] 2.3 Write property test for UUID uniqueness


  - **Property 4: Unique identifiers are always unique**
  - **Validates: Requirements 2.1, 2.3**

- [x] 3. Implement warband validation




- [x] 3.1 Create validation service methods

  - Implement `validateWarband()` method
  - Validate required fields (name, ability, pointLimit)
  - Validate point limit is 75 or 125
  - Validate all weirdos have required fields
  - Return detailed validation errors

  - _Requirements: 4.1, 4.2, 4.3_


- [x] 3.2 Write property test for validation


  - **Property 7: Invalid data is rejected**
  - **Validates: Requirements 4.2**

- [x] 4. Implement save operations




- [x] 4.1 Implement saveWarband method

  - Validate warband data
  - Assign UUID if new warband
  - Set createdAt and updatedAt timestamps
  - Update in-memory cache
  - Persist to JSON file
  - Handle file write errors
  - _Requirements: 1.1-1.12, 2.1, 2.2, 7.2, 7.5, 8.2, 9.1, 9.5_

- [x] 4.2 Write property test for save then load



  - **Property 2: Save then load returns same warband**
  - **Validates: Requirements 1.1-1.12, 3.1-3.11**



- [x] 4.3 Write property test for special characters




  - **Property 3: Special characters are preserved**
  - **Validates: Requirements 9.3, 9.4**

- [x] 4.4 Write property test for timestamp format




  - **Property 8: Timestamp format is ISO 8601**
  - **Validates: Requirements 9.5, 9.6**

- [x] 5. Implement load operations




- [x] 5.1 Implement getWarband method


  - Retrieve warband from in-memory cache by ID
  - Return null if not found
  - _Requirements: 3.1-3.11, 3.12, 7.4_

- [x] 5.2 Implement getAllWarbands method


  - Iterate through in-memory cache
  - Compute WarbandSummary for each warband
  - Calculate totalCost using CostEngine
  - Count weirdos
  - Return array of summaries

  - Handle empty cache

  - _Requirements: 5.1-5.8, 7.4_

- [x] 5.3 Write property test for list completeness



  - **Property 6: List includes all saved warbands**
  - **Validates: Requirements 5.1-5.7**

- [x] 5.4 Write property test for cost calculations



  - **Property 10: Cost calculations are consistent**
  - **Validates: Requirements 5.6**



- [x] 6. Implement delete operations





- [x] 6.1 Implement deleteWarband method

  - Remove warband from in-memory cache
  - Persist deletion to JSON file
  - Return true if deleted, false if not found
  - Handle file write errors

  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 7.3, 7.5_

- [x] 6.2 Write property test for delete




  - **Property 5: Delete removes warband completely**
  - **Validates: Requirements 6.1, 6.4**

- [x] 7. Implement serialization and file I/O




- [x] 7.1 Implement file persistence methods

  - Create `persistToFile()` private method
  - Serialize cache to JSON with proper formatting
  - Write to file using fs/promises
  - Handle write errors with retry logic
  - _Requirements: 8.2, 9.1_



- [x] 7.2 Implement file loading methods

  - Create `loadFromFile()` private method
  - Read file using fs/promises
  - Parse JSON with error handling
  - Handle corrupted data gracefully
  - _Requirements: 3.1, 8.1, 8.3_

- [x] 7.3 Write property test for serialization round trip



  - **Property 1: Serialization round trip preserves data**
  - **Validates: Requirements 9.1, 9.2**


- [x] 7.4 Write property test for cache synchronization



  - **Property 9: In-memory cache stays synchronized**
  - **Validates: Requirements 7.2, 7.3, 7.5**




- [x] 8. Implement error handling




- [x] 8.1 Add comprehensive error handling


  - Wrap file operations in try-catch blocks
  - Throw PersistenceError with appropriate error codes
  - Log errors with details
  - Handle permission errors
  - Handle JSON parse errors
  - _Requirements: 8.1-8.5_

- [x] 8.2 Write unit tests for error scenarios



  - Test file read error handling
  - Test file write error handling
  - Test JSON parse error handling
  - Test permission error handling
  - Test validation error handling
  - _Requirements: 8.1-8.5_

- [x] 9. Add utility methods




- [x] 9.1 Implement helper methods

  - Add `warbandExists(id)` method
  - Add private validation helpers
  - Add private serialization helpers
  - _Requirements: 6.5_

- [x] 9.2 Write unit tests for utility methods


  - Test warbandExists with existing ID
  - Test warbandExists with non-existent ID
  - Test helper functions
  - _Requirements: 6.5_

- [x] 10. Integration and verification



- [x] 10.1 Write integration tests


  - Test complete save → restart → load flow
  - Test save multiple → list all → verify
  - Test save → delete → verify file updated
  - Test corrupted file → initialize → error handling
  - _Requirements: All_

- [x] 10.2 Ensure all tests pass


  - Run all unit tests
  - Run all property-based tests
  - Run all integration tests
  - Fix any failing tests
  - Verify test coverage

- [x] 11. Final cleanup and verification






- [x] 11.1 Clean up temporary build artifacts

  - Remove `*.timestamp-*.mjs` files from workspace root
  - Verify all tests pass

- [x] 11.2 Verify feature completeness

  - Confirm all acceptance criteria are met
  - Review implementation against design document

- [x] 12. Fix failing tests and improve test isolation






- [x] 12.1 Fix DataRepository test isolation issues


  - Add proper cleanup in beforeEach/afterEach hooks
  - Ensure test file is deleted between tests
  - Clear repository cache between tests
  - Fix Property 9, 18, 20, 23 test failures
  - _Requirements: 7.1-7.5, 9.1-9.6_

- [x] 12.2 Fix DataRepository error handling tests


  - Correct PersistenceError type checking in JSON parse error test
  - Fix corrupted file initialization tests
  - _Requirements: 8.1-8.5_

- [x] 12.3 Fix integration test state management


  - Fix "Save multiple → list all → verify" test (expecting 3, getting 4)
  - Fix "Complex integration scenarios" test (expecting 1, getting 4)
  - Ensure proper cleanup between integration tests
  - _Requirements: 5.1-5.8, 6.1-6.5_

- [x] 12.4 Fix warband routes null ability validation


  - Update validation to allow null ability values
  - Fix POST /api/warbands test with null ability
  - _Requirements: 1.2, 4.1_

- [x] 12.5 Fix WeirdoEditor property test for special characters


  - Update test to handle whitespace in weirdo names correctly
  - Ensure UI properly renders names with multiple spaces
  - _Requirements: UI rendering_

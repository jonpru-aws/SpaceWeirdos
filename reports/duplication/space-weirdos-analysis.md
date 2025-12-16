# Space Weirdos Codebase Analysis Report

Generated: 12/16/2025, 3:47:07 PM

## Executive Summary

This analysis identified **73 duplication patterns** across **101 source files** containing **36,162 lines of code**.

### Key Findings

- **Total Functions**: 2102
- **Total Classes**: 115
- **Duplication Patterns**: 73

### Potential Savings

- **Lines of Code**: 3840
- **Files**: 21
- **Estimated Effort**: 458 hours

## Duplication Patterns by Type

- **configuration**: 1
- **functional**: 70
- **pattern**: 2

## Duplication Patterns by Severity

- **high**: 2
- **medium**: 71

## Detailed Findings


### 1. Multiple configuration management approaches detected

- **Type**: configuration
- **Severity**: high
- **Locations**: 26
- **Recommendation**: Consolidate all configuration into ConfigurationManager system

**Affected Files**:
- src\analysis\analyzers\CacheConsolidationAnalyzer.ts
- src\analysis\analyzers\ConfigurationManagementAnalyzer.ts
- src\analysis\analyzers\DependencyInjectionAnalyzer.ts
- src\analysis\cli\AnalysisCLI.ts
- src\analysis\detectors\CacheAnalysisDetector.ts
- src\analysis\detectors\ConfigurationDuplicationDetector.ts
- src\analysis\integration\BuildIntegration.ts
- src\analysis\scripts\analyzeCodebase.ts
- src\analysis\scripts\runSpaceWeirdosAnalysis.ts
- src\backend\config\ConfigurationFactory.ts
- src\backend\config\ConfigurationManager.ts
- src\backend\config\errors.ts
- src\backend\config\index.ts
- src\backend\config\types.ts
- src\backend\routes\importExportRoutes.ts
- src\backend\routes\warbandRoutes.ts
- src\backend\server.ts
- src\backend\services\ValidationService.ts
- src\backend\services\WarbandImportExportService.ts
- src\frontend\components\RetryMechanism.tsx
- src\frontend\config\frontendConfig.ts
- src\frontend\hooks\useCostCalculation.ts
- src\frontend\hooks\useItemCost.ts
- src\frontend\services\apiClient.ts
- src\frontend\services\FileUtils.ts
- src\frontend\services\ImportExportErrorHandler.ts


### 2. Multiple validation implementations detected

- **Type**: functional
- **Severity**: high
- **Locations**: 27
- **Recommendation**: Consolidate validation logic into shared ValidationService utilities

**Affected Files**:
- src\analysis\analyzers\CacheConsolidationAnalyzer.ts
- src\analysis\analyzers\ConfigurationManagementAnalyzer.ts
- src\analysis\analyzers\StrategyGenerator.ts
- src\analysis\analyzers\ValidationConsolidationAnalyzer.ts
- src\analysis\cli\AnalysisCLI.ts
- src\analysis\detectors\ConfigurationDuplicationDetector.ts
- src\analysis\detectors\ValidationDuplicationDetector.ts
- src\analysis\scripts\analyzeCodebase.ts
- src\analysis\scripts\runSpaceWeirdosAnalysis.ts
- src\backend\config\ConfigurationFactory.ts
- src\backend\config\ConfigurationManager.ts
- src\backend\config\errors.ts
- src\backend\config\types.ts
- src\backend\controllers\ImportExportController.ts
- src\backend\errors\AppError.ts
- src\backend\routes\importExportRoutes.ts
- src\backend\routes\warbandRoutes.ts
- src\backend\services\DataRepository.ts
- src\backend\services\NameConflictResolutionService.ts
- src\backend\services\ValidationService.ts
- src\backend\services\WarbandImportExportService.ts
- src\frontend\components\common\ValidationErrorDisplay.tsx
- src\frontend\components\ImportExportErrorDisplay.tsx
- src\frontend\components\NameConflictDialog.tsx
- src\frontend\components\WarbandList.tsx
- src\frontend\contexts\WarbandContext.tsx
- src\frontend\services\FileUtils.ts


### 3. Multiple caching implementations detected

- **Type**: pattern
- **Severity**: medium
- **Locations**: 15
- **Recommendation**: Unify caching implementations using a single, configurable cache utility

**Affected Files**:
- src\analysis\analyzers\CacheConsolidationAnalyzer.ts
- src\analysis\analyzers\ConfigurationManagementAnalyzer.ts
- src\analysis\detectors\CacheAnalysisDetector.ts
- src\analysis\scripts\analyzeCodebase.ts
- src\analysis\scripts\runSpaceWeirdosAnalysis.ts
- src\backend\config\ConfigurationFactory.ts
- src\backend\config\ConfigurationManager.ts
- src\backend\config\types.ts
- src\backend\services\SimpleCache.ts
- src\frontend\config\frontendConfig.ts
- src\frontend\hooks\useCostCalculation.ts
- src\frontend\hooks\useItemCost.ts
- src\frontend\services\CostCache.js
- src\frontend\services\CostCache.ts
- src\frontend\services\ReadmeContentService.ts


### 4. Similar function "duplications" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 3
- **Recommendation**: Consider consolidating "duplications" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ErrorHandlingAnalyzer.ts
- src\analysis\analyzers\ServiceLayerAnalyzer.ts
- src\analysis\detectors\ValidationDuplicationDetector.ts


### 5. Similar function "recommendations" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 3
- **Recommendation**: Consider consolidating "recommendations" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ErrorHandlingAnalyzer.ts
- src\analysis\analyzers\ServiceConsolidationAnalyzer.ts
- src\analysis\analyzers\ValidationConsolidationAnalyzer.ts


### 6. Similar function "opportunities" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 3
- **Recommendation**: Consider consolidating "opportunities" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ErrorHandlingAnalyzer.ts
- src\analysis\analyzers\ServiceConsolidationAnalyzer.ts
- src\analysis\analyzers\ValidationConsolidationAnalyzer.ts


### 7. Similar function "opportunity" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 2
- **Recommendation**: Consider consolidating "opportunity" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ErrorHandlingAnalyzer.ts
- src\analysis\analyzers\ValidationConsolidationAnalyzer.ts


### 8. Similar function "recommendation" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 2
- **Recommendation**: Consider consolidating "recommendation" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ErrorHandlingAnalyzer.ts
- src\analysis\analyzers\ValidationConsolidationAnalyzer.ts


### 9. Similar function "groupedduplications" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 2
- **Recommendation**: Consider consolidating "groupedduplications" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ErrorHandlingAnalyzer.ts
- src\analysis\analyzers\ValidationConsolidationAnalyzer.ts


### 10. Similar function "groups" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 3
- **Recommendation**: Consider consolidating "groups" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ErrorHandlingAnalyzer.ts
- src\analysis\analyzers\ServiceConsolidationAnalyzer.ts
- src\analysis\analyzers\ValidationConsolidationAnalyzer.ts


### 11. Similar function "duplication" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 4
- **Recommendation**: Consider consolidating "duplication" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ErrorHandlingAnalyzer.ts
- src\analysis\analyzers\ServiceLayerAnalyzer.ts
- src\analysis\analyzers\ValidationConsolidationAnalyzer.ts
- src\analysis\detectors\ValidationDuplicationDetector.ts


### 12. Similar function "pattern" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 3
- **Recommendation**: Consider consolidating "pattern" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ErrorHandlingAnalyzer.ts
- src\analysis\analyzers\ValidationConsolidationAnalyzer.ts
- src\analysis\detectors\ValidationDuplicationDetector.ts


### 13. Similar function "affectedfiles" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 3
- **Recommendation**: Consider consolidating "affectedfiles" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ErrorHandlingAnalyzer.ts
- src\analysis\analyzers\StrategyGenerator.ts
- src\analysis\analyzers\ValidationConsolidationAnalyzer.ts


### 14. Similar function "estimatedsavings" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 2
- **Recommendation**: Consider consolidating "estimatedsavings" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ErrorHandlingAnalyzer.ts
- src\analysis\analyzers\ValidationConsolidationAnalyzer.ts


### 15. Similar function "type" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 4
- **Recommendation**: Consider consolidating "type" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ErrorHandlingAnalyzer.ts
- src\analysis\analyzers\StrategyGenerator.ts
- src\analysis\analyzers\ValidationConsolidationAnalyzer.ts
- src\backend\services\ErrorCategorizationService.ts


### 16. Similar function "consolidationtarget" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 2
- **Recommendation**: Consider consolidating "consolidationtarget" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ErrorHandlingAnalyzer.ts
- src\analysis\analyzers\ValidationConsolidationAnalyzer.ts


### 17. Similar function "files" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 2
- **Recommendation**: Consider consolidating "files" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ErrorHandlingAnalyzer.ts
- src\analysis\analyzers\ValidationConsolidationAnalyzer.ts


### 18. Similar function "location" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 3
- **Recommendation**: Consider consolidating "location" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ErrorHandlingAnalyzer.ts
- src\analysis\analyzers\ValidationConsolidationAnalyzer.ts
- src\analysis\detectors\ValidationDuplicationDetector.ts


### 19. Similar function "totallines" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 3
- **Recommendation**: Consider consolidating "totallines" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ErrorHandlingAnalyzer.ts
- src\analysis\analyzers\ValidationConsolidationAnalyzer.ts
- src\analysis\detectors\ValidationDuplicationDetector.ts


### 20. Similar function "complexity" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 3
- **Recommendation**: Consider consolidating "complexity" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ErrorHandlingAnalyzer.ts
- src\analysis\analyzers\ServiceConsolidationAnalyzer.ts
- src\analysis\analyzers\ValidationConsolidationAnalyzer.ts


### 21. Similar function "risks" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 3
- **Recommendation**: Consider consolidating "risks" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ErrorHandlingAnalyzer.ts
- src\analysis\analyzers\ServiceConsolidationAnalyzer.ts
- src\analysis\analyzers\ValidationConsolidationAnalyzer.ts


### 22. Similar function "migrationstrategy" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 2
- **Recommendation**: Consider consolidating "migrationstrategy" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ErrorHandlingAnalyzer.ts
- src\analysis\analyzers\ValidationConsolidationAnalyzer.ts


### 23. Similar function "benefits" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 3
- **Recommendation**: Consider consolidating "benefits" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ErrorHandlingAnalyzer.ts
- src\analysis\analyzers\ServiceConsolidationAnalyzer.ts
- src\analysis\analyzers\ValidationConsolidationAnalyzer.ts


### 24. Similar function "filecount" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 2
- **Recommendation**: Consider consolidating "filecount" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ErrorHandlingAnalyzer.ts
- src\analysis\analyzers\ValidationConsolidationAnalyzer.ts


### 25. Similar function "duplicationcount" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 2
- **Recommendation**: Consider consolidating "duplicationcount" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ErrorHandlingAnalyzer.ts
- src\analysis\analyzers\ValidationConsolidationAnalyzer.ts


### 26. Similar function "level" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 2
- **Recommendation**: Consider consolidating "level" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ErrorHandlingAnalyzer.ts
- src\analysis\analyzers\ValidationConsolidationAnalyzer.ts


### 27. Similar function "factors" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 2
- **Recommendation**: Consider consolidating "factors" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ErrorHandlingAnalyzer.ts
- src\analysis\analyzers\ValidationConsolidationAnalyzer.ts


### 28. Similar function "steps" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 4
- **Recommendation**: Consider consolidating "steps" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ErrorHandlingAnalyzer.ts
- src\analysis\analyzers\ServiceConsolidationAnalyzer.ts
- src\analysis\analyzers\StrategyGenerator.ts
- src\analysis\analyzers\ValidationConsolidationAnalyzer.ts


### 29. Similar function "classification" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 2
- **Recommendation**: Consider consolidating "classification" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ErrorHandlingAnalyzer.ts
- src\frontend\services\ToastService.ts


### 30. Similar function "template" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 2
- **Recommendation**: Consider consolidating "template" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ErrorHandlingAnalyzer.ts
- src\analysis\detectors\ValidationDuplicationDetector.ts


### 31. Similar function "message" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 5
- **Recommendation**: Consider consolidating "message" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ErrorHandlingAnalyzer.ts
- src\analysis\analyzers\ValidationConsolidationAnalyzer.ts
- src\analysis\detectors\ValidationDuplicationDetector.ts
- src\backend\services\ValidationService.ts
- src\backend\services\WarbandImportExportService.ts


### 32. Similar function "result" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 2
- **Recommendation**: Consider consolidating "result" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ErrorHandlingAnalyzer.ts
- src\analysis\analyzers\StrategyGenerator.ts


### 33. Similar function "impact" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 3
- **Recommendation**: Consider consolidating "impact" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ErrorHandlingAnalyzer.ts
- src\analysis\analyzers\ServiceLayerAnalyzer.ts
- src\analysis\analyzers\ValidationConsolidationAnalyzer.ts


### 34. Similar function "basehours" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 3
- **Recommendation**: Consider consolidating "basehours" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ErrorHandlingAnalyzer.ts
- src\analysis\analyzers\StrategyGenerator.ts
- src\analysis\analyzers\ValidationConsolidationAnalyzer.ts


### 35. Similar function "complexitymultiplier" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 2
- **Recommendation**: Consider consolidating "complexitymultiplier" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ErrorHandlingAnalyzer.ts
- src\analysis\analyzers\ValidationConsolidationAnalyzer.ts


### 36. Similar function "dependencies" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 3
- **Recommendation**: Consider consolidating "dependencies" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ErrorHandlingAnalyzer.ts
- src\analysis\analyzers\ServiceLayerAnalyzer.ts
- src\analysis\analyzers\ValidationConsolidationAnalyzer.ts


### 37. Similar function "priorityorder" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 2
- **Recommendation**: Consider consolidating "priorityorder" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ErrorHandlingAnalyzer.ts
- src\analysis\analyzers\ValidationConsolidationAnalyzer.ts


### 38. Similar function "prioritydiff" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 2
- **Recommendation**: Consider consolidating "prioritydiff" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ErrorHandlingAnalyzer.ts
- src\analysis\analyzers\ValidationConsolidationAnalyzer.ts


### 39. Similar function "servicearray" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 2
- **Recommendation**: Consider consolidating "servicearray" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ServiceConsolidationAnalyzer.ts
- src\analysis\analyzers\ServiceLayerAnalyzer.ts


### 40. Similar function "service" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 3
- **Recommendation**: Consider consolidating "service" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ServiceConsolidationAnalyzer.ts
- src\analysis\analyzers\ServiceLayerAnalyzer.ts
- src\analysis\analyzers\StrategyGenerator.ts


### 41. Similar function "method" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 2
- **Recommendation**: Consider consolidating "method" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ServiceConsolidationAnalyzer.ts
- src\analysis\analyzers\ServiceLayerAnalyzer.ts


### 42. Similar function "totalcomplexity" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 2
- **Recommendation**: Consider consolidating "totalcomplexity" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ServiceConsolidationAnalyzer.ts
- src\analysis\analyzers\ServiceLayerAnalyzer.ts


### 43. Similar function "overlapratio" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 2
- **Recommendation**: Consider consolidating "overlapratio" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ServiceConsolidationAnalyzer.ts
- src\analysis\analyzers\ServiceLayerAnalyzer.ts


### 44. Similar function "commonresponsibilities" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 2
- **Recommendation**: Consider consolidating "commonresponsibilities" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ServiceConsolidationAnalyzer.ts
- src\analysis\analyzers\ServiceLayerAnalyzer.ts


### 45. Similar function "totallinesofcode" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 2
- **Recommendation**: Consider consolidating "totallinesofcode" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ServiceConsolidationAnalyzer.ts
- src\analysis\analyzers\ServiceLayerAnalyzer.ts


### 46. Similar function "serviceinfo" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 2
- **Recommendation**: Consider consolidating "serviceinfo" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ServiceConsolidationAnalyzer.ts
- src\analysis\analyzers\ServiceLayerAnalyzer.ts


### 47. Similar function "hours" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 2
- **Recommendation**: Consider consolidating "hours" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ServiceConsolidationAnalyzer.ts
- src\analysis\analyzers\StrategyGenerator.ts


### 48. Similar function "file" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 2
- **Recommendation**: Consider consolidating "file" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ServiceLayerAnalyzer.ts
- src\analysis\detectors\ValidationDuplicationDetector.ts


### 49. Similar function "patterns" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 2
- **Recommendation**: Consider consolidating "patterns" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ServiceLayerAnalyzer.ts
- src\analysis\detectors\ValidationDuplicationDetector.ts


### 50. Similar function "severity" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 2
- **Recommendation**: Consider consolidating "severity" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ServiceLayerAnalyzer.ts
- src\backend\services\ErrorCategorizationService.ts


### 51. Similar function "similarity" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 2
- **Recommendation**: Consider consolidating "similarity" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ServiceLayerAnalyzer.ts
- src\analysis\detectors\ValidationDuplicationDetector.ts


### 52. Similar function "locations" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 2
- **Recommendation**: Consider consolidating "locations" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ServiceLayerAnalyzer.ts
- src\analysis\detectors\ValidationDuplicationDetector.ts


### 53. Similar function "from" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 2
- **Recommendation**: Consider consolidating "from" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ServiceLayerAnalyzer.ts
- src\backend\services\ValidationService.ts


### 54. Similar function "errors" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 4
- **Recommendation**: Consider consolidating "errors" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ValidationConsolidationAnalyzer.ts
- src\backend\services\NameConflictResolutionService.ts
- src\backend\services\ValidationService.ts
- src\backend\services\WarbandImportExportService.ts


### 55. Similar function "validator" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 2
- **Recommendation**: Consider consolidating "validator" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ValidationConsolidationAnalyzer.ts
- src\backend\services\ValidationService.ts


### 56. Similar function "condition" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 2
- **Recommendation**: Consider consolidating "condition" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\analyzers\ValidationConsolidationAnalyzer.ts
- src\backend\services\ValidationService.ts


### 57. Similar function "content" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 2
- **Recommendation**: Consider consolidating "content" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\detectors\ValidationDuplicationDetector.ts
- src\frontend\services\ReadmeContentService.ts


### 58. Similar function "errormessage" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 4
- **Recommendation**: Consider consolidating "errormessage" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\detectors\ValidationDuplicationDetector.ts
- src\backend\services\NameConflictResolutionService.ts
- src\backend\services\WarbandImportExportService.ts
- src\frontend\services\ReadmeContentService.ts


### 59. Similar function "rule" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 1
- **Recommendation**: Consider consolidating "rule" functionality into a shared utility or base service

**Affected Files**:
- src\analysis\detectors\ValidationDuplicationDetector.ts


### 60. Similar function "userfriendlymessage" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 2
- **Recommendation**: Consider consolidating "userfriendlymessage" functionality into a shared utility or base service

**Affected Files**:
- src\backend\services\ErrorCategorizationService.ts
- src\frontend\services\ToastService.ts


### 61. Similar function "suggestions" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 2
- **Recommendation**: Consider consolidating "suggestions" functionality into a shared utility or base service

**Affected Files**:
- src\backend\services\ErrorCategorizationService.ts
- src\backend\services\NameConflictResolutionService.ts


### 62. Similar function "cost" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 2
- **Recommendation**: Consider consolidating "cost" functionality into a shared utility or base service

**Affected Files**:
- src\backend\services\ErrorCategorizationService.ts
- src\backend\services\ValidationService.ts


### 63. Similar function "totalcost" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 3
- **Recommendation**: Consider consolidating "totalcost" functionality into a shared utility or base service

**Affected Files**:
- src\backend\services\ErrorCategorizationService.ts
- src\backend\services\ValidationService.ts
- src\backend\services\WarbandService.ts


### 64. Similar function "warnings" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 2
- **Recommendation**: Consider consolidating "warnings" functionality into a shared utility or base service

**Affected Files**:
- src\backend\services\ValidationService.ts
- src\backend\services\WarbandImportExportService.ts


### 65. Similar function "requiredattributes" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 2
- **Recommendation**: Consider consolidating "requiredattributes" functionality into a shared utility or base service

**Affected Files**:
- src\backend\services\ValidationService.ts
- src\backend\services\WarbandImportExportService.ts


### 66. Similar function "attr" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 2
- **Recommendation**: Consider consolidating "attr" functionality into a shared utility or base service

**Affected Files**:
- src\backend\services\ValidationService.ts
- src\backend\services\WarbandImportExportService.ts


### 67. Similar function "costconfig" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 2
- **Recommendation**: Consider consolidating "costconfig" functionality into a shared utility or base service

**Affected Files**:
- src\backend\services\ValidationService.ts
- src\backend\services\WarbandImportExportService.ts


### 68. Similar function "validationconfig" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 2
- **Recommendation**: Consider consolidating "validationconfig" functionality into a shared utility or base service

**Affected Files**:
- src\backend\services\ValidationService.ts
- src\backend\services\WarbandImportExportService.ts


### 69. Similar function "maxequipment" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 2
- **Recommendation**: Consider consolidating "maxequipment" functionality into a shared utility or base service

**Affected Files**:
- src\backend\services\ValidationService.ts
- src\backend\services\WarbandImportExportService.ts


### 70. Similar function "limiterror" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 1
- **Recommendation**: Consider consolidating "limiterror" functionality into a shared utility or base service

**Affected Files**:
- src\backend\services\ValidationService.ts


### 71. Similar function "warband" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 2
- **Recommendation**: Consider consolidating "warband" functionality into a shared utility or base service

**Affected Files**:
- src\backend\services\WarbandImportExportService.ts
- src\backend\services\WarbandService.ts


### 72. Similar function "data" found in multiple services

- **Type**: functional
- **Severity**: medium
- **Locations**: 2
- **Recommendation**: Consider consolidating "data" functionality into a shared utility or base service

**Affected Files**:
- src\backend\services\WarbandImportExportService.ts
- src\frontend\services\ReadmeContentService.ts


### 73. Multiple error handling implementations detected

- **Type**: pattern
- **Severity**: medium
- **Locations**: 32
- **Recommendation**: Standardize error handling using consistent patterns and utilities

**Affected Files**:
- src\analysis\analyzers\ErrorHandlingAnalyzer.ts
- src\analysis\analyzers\ValidationConsolidationAnalyzer.ts
- src\analysis\detectors\ErrorHandlingDuplicationDetector.ts
- src\analysis\detectors\ValidationDuplicationDetector.ts
- src\analysis\scripts\analyzeCodebase.ts
- src\analysis\scripts\runSpaceWeirdosAnalysis.ts
- src\backend\config\ConfigurationManager.ts
- src\backend\config\errors.ts
- src\backend\controllers\ImportExportController.ts
- src\backend\errors\AppError.ts
- src\backend\models\types.ts
- src\backend\routes\warbandRoutes.ts
- src\backend\services\DataRepository.ts
- src\backend\services\ErrorCategorizationService.ts
- src\backend\services\NameConflictResolutionService.ts
- src\backend\services\ValidationService.ts
- src\backend\services\WarbandImportExportService.ts
- src\backend\utils\typeGuards.ts
- src\frontend\App.tsx
- src\frontend\components\common\ValidationErrorDisplay.tsx
- src\frontend\components\ImportExportErrorDisplay.tsx
- src\frontend\components\NameConflictDialog.tsx
- src\frontend\components\WarbandEditor.tsx
- src\frontend\components\WarbandList.tsx
- src\frontend\components\WarbandProperties.tsx
- src\frontend\components\WeirdoCard.tsx
- src\frontend\contexts\GameDataContext.tsx
- src\frontend\contexts\WarbandContext.tsx
- src\frontend\services\apiClient.ts
- src\frontend\services\FileUtils.ts
- src\frontend\services\ImportExportErrorHandler.ts
- src\frontend\services\ReadmeContentService.ts


## Recommendations


### 1. Centralize Configuration

- **Priority**: high
- **Type**: migration
- **Estimated Effort**: 16 hours
- **Complexity**: medium

**Description**: Consolidate all configuration into ConfigurationManager system

**Benefits**:
- Eliminate 25 duplicate implementations
- Improve code maintainability
- Reduce technical debt
- Centralize configuration management
- Significant maintainability improvement

**Implementation Steps**:
1. Set up centralized configuration: Ensure ConfigurationManager is properly configured
2. Identify consolidation target: Choose the best implementation to keep and enhance
3. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
4. Update tests: Ensure all tests pass with consolidated implementation


### 2. Unify Duplicate Functionality

- **Priority**: high
- **Type**: refactoring
- **Estimated Effort**: 16 hours
- **Complexity**: medium

**Description**: Consolidate validation logic into shared ValidationService utilities

**Benefits**:
- Eliminate 26 duplicate implementations
- Improve code maintainability
- Reduce technical debt
- Significant maintainability improvement

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 3. Abstract Repeated Patterns

- **Priority**: medium
- **Type**: abstraction
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Unify caching implementations using a single, configurable cache utility

**Benefits**:
- Eliminate 14 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 4. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "duplications" functionality into a shared utility or base service

**Benefits**:
- Eliminate 2 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 5. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "recommendations" functionality into a shared utility or base service

**Benefits**:
- Eliminate 2 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 6. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "opportunities" functionality into a shared utility or base service

**Benefits**:
- Eliminate 2 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 7. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "opportunity" functionality into a shared utility or base service

**Benefits**:
- Eliminate 1 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 8. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "recommendation" functionality into a shared utility or base service

**Benefits**:
- Eliminate 1 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 9. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "groupedduplications" functionality into a shared utility or base service

**Benefits**:
- Eliminate 1 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 10. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "groups" functionality into a shared utility or base service

**Benefits**:
- Eliminate 2 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 11. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "duplication" functionality into a shared utility or base service

**Benefits**:
- Eliminate 3 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 12. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "pattern" functionality into a shared utility or base service

**Benefits**:
- Eliminate 2 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 13. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "affectedfiles" functionality into a shared utility or base service

**Benefits**:
- Eliminate 2 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 14. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "estimatedsavings" functionality into a shared utility or base service

**Benefits**:
- Eliminate 1 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 15. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "type" functionality into a shared utility or base service

**Benefits**:
- Eliminate 3 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 16. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "consolidationtarget" functionality into a shared utility or base service

**Benefits**:
- Eliminate 1 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 17. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "files" functionality into a shared utility or base service

**Benefits**:
- Eliminate 1 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 18. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "location" functionality into a shared utility or base service

**Benefits**:
- Eliminate 2 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 19. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "totallines" functionality into a shared utility or base service

**Benefits**:
- Eliminate 2 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 20. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "complexity" functionality into a shared utility or base service

**Benefits**:
- Eliminate 2 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 21. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "risks" functionality into a shared utility or base service

**Benefits**:
- Eliminate 2 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 22. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "migrationstrategy" functionality into a shared utility or base service

**Benefits**:
- Eliminate 1 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 23. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "benefits" functionality into a shared utility or base service

**Benefits**:
- Eliminate 2 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 24. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "filecount" functionality into a shared utility or base service

**Benefits**:
- Eliminate 1 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 25. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "duplicationcount" functionality into a shared utility or base service

**Benefits**:
- Eliminate 1 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 26. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "level" functionality into a shared utility or base service

**Benefits**:
- Eliminate 1 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 27. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "factors" functionality into a shared utility or base service

**Benefits**:
- Eliminate 1 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 28. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "steps" functionality into a shared utility or base service

**Benefits**:
- Eliminate 3 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 29. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "classification" functionality into a shared utility or base service

**Benefits**:
- Eliminate 1 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 30. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "template" functionality into a shared utility or base service

**Benefits**:
- Eliminate 1 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 31. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "message" functionality into a shared utility or base service

**Benefits**:
- Eliminate 4 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 32. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "result" functionality into a shared utility or base service

**Benefits**:
- Eliminate 1 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 33. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "impact" functionality into a shared utility or base service

**Benefits**:
- Eliminate 2 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 34. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "basehours" functionality into a shared utility or base service

**Benefits**:
- Eliminate 2 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 35. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "complexitymultiplier" functionality into a shared utility or base service

**Benefits**:
- Eliminate 1 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 36. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "dependencies" functionality into a shared utility or base service

**Benefits**:
- Eliminate 2 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 37. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "priorityorder" functionality into a shared utility or base service

**Benefits**:
- Eliminate 1 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 38. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "prioritydiff" functionality into a shared utility or base service

**Benefits**:
- Eliminate 1 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 39. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "servicearray" functionality into a shared utility or base service

**Benefits**:
- Eliminate 1 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 40. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "service" functionality into a shared utility or base service

**Benefits**:
- Eliminate 2 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 41. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "method" functionality into a shared utility or base service

**Benefits**:
- Eliminate 1 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 42. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "totalcomplexity" functionality into a shared utility or base service

**Benefits**:
- Eliminate 1 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 43. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "overlapratio" functionality into a shared utility or base service

**Benefits**:
- Eliminate 1 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 44. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "commonresponsibilities" functionality into a shared utility or base service

**Benefits**:
- Eliminate 1 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 45. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "totallinesofcode" functionality into a shared utility or base service

**Benefits**:
- Eliminate 1 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 46. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "serviceinfo" functionality into a shared utility or base service

**Benefits**:
- Eliminate 1 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 47. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "hours" functionality into a shared utility or base service

**Benefits**:
- Eliminate 1 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 48. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "file" functionality into a shared utility or base service

**Benefits**:
- Eliminate 1 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 49. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "patterns" functionality into a shared utility or base service

**Benefits**:
- Eliminate 1 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 50. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "severity" functionality into a shared utility or base service

**Benefits**:
- Eliminate 1 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 51. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "similarity" functionality into a shared utility or base service

**Benefits**:
- Eliminate 1 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 52. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "locations" functionality into a shared utility or base service

**Benefits**:
- Eliminate 1 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 53. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "from" functionality into a shared utility or base service

**Benefits**:
- Eliminate 1 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 54. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "errors" functionality into a shared utility or base service

**Benefits**:
- Eliminate 3 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 55. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "validator" functionality into a shared utility or base service

**Benefits**:
- Eliminate 1 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 56. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "condition" functionality into a shared utility or base service

**Benefits**:
- Eliminate 1 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 57. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "content" functionality into a shared utility or base service

**Benefits**:
- Eliminate 1 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 58. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "errormessage" functionality into a shared utility or base service

**Benefits**:
- Eliminate 3 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 59. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "rule" functionality into a shared utility or base service

**Benefits**:
- Eliminate 0 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 60. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "userfriendlymessage" functionality into a shared utility or base service

**Benefits**:
- Eliminate 1 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 61. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "suggestions" functionality into a shared utility or base service

**Benefits**:
- Eliminate 1 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 62. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "cost" functionality into a shared utility or base service

**Benefits**:
- Eliminate 1 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 63. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "totalcost" functionality into a shared utility or base service

**Benefits**:
- Eliminate 2 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 64. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "warnings" functionality into a shared utility or base service

**Benefits**:
- Eliminate 1 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 65. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "requiredattributes" functionality into a shared utility or base service

**Benefits**:
- Eliminate 1 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 66. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "attr" functionality into a shared utility or base service

**Benefits**:
- Eliminate 1 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 67. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "costconfig" functionality into a shared utility or base service

**Benefits**:
- Eliminate 1 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 68. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "validationconfig" functionality into a shared utility or base service

**Benefits**:
- Eliminate 1 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 69. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "maxequipment" functionality into a shared utility or base service

**Benefits**:
- Eliminate 1 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 70. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "limiterror" functionality into a shared utility or base service

**Benefits**:
- Eliminate 0 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 71. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "warband" functionality into a shared utility or base service

**Benefits**:
- Eliminate 1 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 72. Unify Duplicate Functionality

- **Priority**: medium
- **Type**: refactoring
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Consider consolidating "data" functionality into a shared utility or base service

**Benefits**:
- Eliminate 1 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


### 73. Abstract Repeated Patterns

- **Priority**: medium
- **Type**: abstraction
- **Estimated Effort**: 6 hours
- **Complexity**: low

**Description**: Standardize error handling using consistent patterns and utilities

**Benefits**:
- Eliminate 31 duplicate implementations
- Improve code maintainability
- Reduce technical debt

**Implementation Steps**:
1. Identify consolidation target: Choose the best implementation to keep and enhance
2. Refactor duplicate code: Replace duplicates with calls to consolidated implementation
3. Update tests: Ensure all tests pass with consolidated implementation


## File Complexity Analysis

- **src\analysis\analyzers\CacheConsolidationAnalyzer.ts**: 831 lines, 39 functions, 3 classes (high complexity)
- **src\analysis\analyzers\ComplexityEstimator.ts**: 325 lines, 24 functions, 1 classes (high complexity)
- **src\analysis\analyzers\ConfigurationManagementAnalyzer.ts**: 510 lines, 45 functions, 1 classes (high complexity)
- **src\analysis\analyzers\DependencyInjectionAnalyzer.ts**: 654 lines, 40 functions, 1 classes (high complexity)
- **src\analysis\analyzers\ErrorHandlingAnalyzer.ts**: 943 lines, 46 functions, 7 classes (high complexity)
- **src\analysis\analyzers\ImpactAnalyzer.ts**: 199 lines, 30 functions, 1 classes (high complexity)
- **src\analysis\analyzers\ServiceConsolidationAnalyzer.ts**: 914 lines, 57 functions, 11 classes (high complexity)
- **src\analysis\analyzers\ServiceLayerAnalyzer.ts**: 686 lines, 57 functions, 3 classes (high complexity)
- **src\analysis\analyzers\SimilarityAnalyzer.ts**: 507 lines, 39 functions, 2 classes (high complexity)
- **src\analysis\analyzers\SingletonPatternAnalyzer.ts**: 815 lines, 66 functions, 6 classes (high complexity)

## Next Steps

1. **Prioritize High-Severity Issues**: Focus on 2 high-priority duplications
2. **Configuration Consolidation**: Implement centralized configuration management
3. **Service Layer Optimization**: Consolidate overlapping service functionality
4. **Validation Unification**: Create shared validation utilities
5. **Cache Standardization**: Implement unified caching strategy

---

*This report was generated by the Space Weirdos Code Duplication Analysis tool.*

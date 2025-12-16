---
inclusion: manual
---

# Configuration System Standards

This file contains mandatory standards for using the centralized Configuration System to prevent code drift and maintain consistency.

## MANDATORY Configuration Usage

### Rule: NO Magic Numbers or Hard-coded Constants (Backend/Business Logic)

**All backend numeric constants, string constants, and business logic configuration values MUST use the ConfigurationManager.**

**IMPORTANT:** This rule applies to backend business logic, API configuration, and application behavior. UI design tokens (colors, spacing, typography) are managed separately through the CSS-based UI Design System.

```typescript
// ✅ CORRECT
import { ConfigurationManager } from '../config/ConfigurationManager.js';

const configManager = ConfigurationManager.getInstance();
await configManager.initialize();

// Access configuration values
const pointLimit = configManager.getCostConfig().pointLimits.standard;
const maxRetries = configManager.getApiConfig().maxRetries;
const cacheSize = configManager.getCacheConfig().defaultMaxSize;
const validationMessage = configManager.getValidationConfig().messages.warbandNameRequired;
```

```typescript
// ❌ WRONG - Backend constants (will be rejected in code review)
const POINT_LIMIT = 75;
const MAX_RETRIES = 3;
const CACHE_SIZE = 100;
const ERROR_MESSAGE = "Warband name is required";
```

**Note:** UI design tokens like colors, spacing, and typography are managed through CSS custom properties in the UI Design System (`src/frontend/styles/tokens/`), not through ConfigurationManager.

### Configuration vs UI Design Tokens

### Configuration System (Backend/Business Logic)
**Use ConfigurationManager for:**
- Business logic constants (point limits, trooper limits)
- API configuration (URLs, timeouts, retries)
- Cache settings (sizes, TTL values)
- Validation thresholds and messages
- Environment-specific behavior
- Server configuration (ports, paths)

### UI Design System (Frontend/Visual Design)
**Use CSS custom properties for:**
- Colors (primary, secondary, semantic colors)
- Spacing (margins, padding, gaps)
- Typography (font sizes, weights, line heights)
- Shadows and borders
- Animation timing and easing
- Breakpoints for responsive design

**Location:** `src/frontend/styles/tokens/`

**Example UI Design Tokens:**
```css
:root {
  --color-primary-500: #3b82f6;
  --spacing-4: 1rem;
  --font-size-lg: 1.125rem;
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
```

**Usage in Components:**
```css
.my-component {
  color: var(--color-primary-500);
  padding: var(--spacing-4);
  font-size: var(--font-size-lg);
  box-shadow: var(--shadow-md);
}
```

## Configuration Categories and Access Patterns

**Server Configuration:**
```typescript
const serverConfig = configManager.getServerConfig();
const port = serverConfig.port;
const host = serverConfig.host;
const corsOrigins = serverConfig.corsOrigins;
const dataPath = serverConfig.dataPath;
```

**API Configuration:**
```typescript
const apiConfig = configManager.getApiConfig();
const baseUrl = apiConfig.baseUrl;
const maxRetries = apiConfig.maxRetries;
const timeout = apiConfig.timeoutMs;
```

**Cache Configuration:**
```typescript
const cacheConfig = configManager.getCacheConfig();
const defaultSize = cacheConfig.defaultMaxSize;
const defaultTtl = cacheConfig.defaultTtlMs;

// Or use the factory method for purpose-specific caches
const itemCostCache = configManager.createCacheInstance<ItemCost>('item-cost');
const validationCache = configManager.createCacheInstance<ValidationResult>('validation-result');
```

**Cost Configuration:**
```typescript
const costConfig = configManager.getCostConfig();
const standardLimit = costConfig.pointLimits.standard;
const extendedLimit = costConfig.pointLimits.extended;
const trooperLimit = costConfig.trooperLimits.standardLimit;
const leaderEquipmentLimit = costConfig.equipmentLimits.leaderStandard;
const mutantDiscount = costConfig.discountValues.mutantDiscount;
const mutantWeapons = costConfig.abilityWeaponLists.mutantWeapons;
```

**Validation Configuration:**
```typescript
const validationConfig = configManager.getValidationConfig();
const warningThreshold = validationConfig.costWarningThreshold;
const contextAwareWarnings = validationConfig.enableContextAwareWarnings;
const messages = validationConfig.messages;
const warbandNameError = messages.warbandNameRequired;
```

**Environment Configuration:**
```typescript
const envConfig = configManager.getEnvironmentConfig();
const environment = envConfig.environment;
const isProduction = envConfig.isProduction;
const debugEnabled = envConfig.debugEnabled;
const logLevel = envConfig.logLevel;
```

## Environment Variable Override System

### Standard Environment Variables

**Server Configuration:**
- `PORT` - Server port (default: 3001)
- `HOST` - Server host (default: localhost)
- `CORS_ORIGINS` - Comma-separated CORS origins
- `STATIC_PATH` - Static files path (default: dist)
- `DATA_PATH` - Data files path (default: data)
- `WARBAND_DATA_PATH` - Warband data file path (default: data/warbands.json)
- `ENABLE_AUTO_SAVE` - Enable auto-save (default: true)

**API Configuration:**
- `VITE_API_URL` - API base URL (default: http://localhost:3001/api)
- `API_MAX_RETRIES` - Maximum retry attempts (default: 3)
- `API_RETRY_DELAY_MS` - Retry delay in milliseconds (default: 1000)
- `API_TIMEOUT_MS` - Request timeout in milliseconds (default: 10000)

**Cache Configuration:**
- `CACHE_DEFAULT_MAX_SIZE` - Default cache size (default: 100)
- `CACHE_DEFAULT_TTL_MS` - Default TTL in milliseconds (default: 5000)
- `CACHE_ITEM_COST_SIZE` - Item cost cache size (default: 200)
- `CACHE_ITEM_COST_TTL` - Item cost cache TTL (default: 10000)
- `CACHE_COST_CALC_SIZE` - Cost calculation cache size (default: 100)
- `CACHE_COST_CALC_TTL` - Cost calculation cache TTL (default: 5000)
- `CACHE_VALIDATION_SIZE` - Validation cache size (default: 50)
- `CACHE_VALIDATION_TTL` - Validation cache TTL (default: 30000)
- `CACHE_API_RESPONSE_SIZE` - API response cache size (default: 100)
- `CACHE_API_RESPONSE_TTL` - API response cache TTL (default: 60000)

**Cost Configuration:**
- `POINT_LIMIT_STANDARD` - Standard point limit (default: 75)
- `POINT_LIMIT_EXTENDED` - Extended point limit (default: 125)
- `POINT_LIMIT_WARNING_THRESHOLD` - Warning threshold (default: 0.9)
- `TROOPER_LIMIT_STANDARD` - Standard trooper limit (default: 20)
- `TROOPER_LIMIT_MAXIMUM` - Maximum trooper limit (default: 25)
- `TROOPER_SPECIAL_SLOT_MIN` - Special slot minimum (default: 21)
- `TROOPER_SPECIAL_SLOT_MAX` - Special slot maximum (default: 25)
- `EQUIPMENT_LIMIT_LEADER_STANDARD` - Leader equipment limit (default: 2)
- `EQUIPMENT_LIMIT_LEADER_CYBORGS` - Leader equipment limit with Cyborgs (default: 3)
- `EQUIPMENT_LIMIT_TROOPER_STANDARD` - Trooper equipment limit (default: 1)
- `EQUIPMENT_LIMIT_TROOPER_CYBORGS` - Trooper equipment limit with Cyborgs (default: 3)
- `DISCOUNT_MUTANT` - Mutant discount value (default: 1)
- `DISCOUNT_HEAVILY_ARMED` - Heavily armed discount value (default: 1)

**Validation Configuration:**
- `VALIDATION_COST_WARNING_THRESHOLD` - Cost warning threshold (default: 0.9)
- `VALIDATION_CONTEXT_AWARE_WARNINGS` - Enable context-aware warnings (default: true)
- `VALIDATION_STRICT_MODE` - Enable strict validation (default: false)

**Environment Configuration:**
- `NODE_ENV` - Environment (development/production/test)
- `LOG_LEVEL` - Logging level (error/warn/info/debug)
- `DEBUG_ENABLED` - Enable debug mode (default: false)
- `ENABLE_PERFORMANCE_MONITORING` - Enable performance monitoring (default: false)
- `ENABLE_DETAILED_ERRORS` - Enable detailed error reporting (default: true)

## Initialization Pattern

### Service/Class Initialization

```typescript
export class MyService {
  private configManager: ConfigurationManager;
  private costConfig: CostConfig;
  private cacheConfig: CacheConfig;

  constructor() {
    this.configManager = ConfigurationManager.getInstance();
  }

  async initialize(): Promise<void> {
    await this.configManager.initialize();
    this.costConfig = this.configManager.getCostConfig();
    this.cacheConfig = this.configManager.getCacheConfig();
  }

  someMethod(): number {
    // ✅ CORRECT - Use cached config
    return this.costConfig.pointLimits.standard;
  }
}
```

### Component/Function Usage

```typescript
// ✅ CORRECT - For functions that need configuration
export async function calculateCost(weirdo: Weirdo): Promise<number> {
  const configManager = ConfigurationManager.getInstance();
  const costConfig = configManager.getCostConfig();
  
  const baseLimit = costConfig.pointLimits.standard;
  const discount = costConfig.discountValues.mutantDiscount;
  
  // Use configuration values...
}
```

## Migration from Legacy Constants

### Deprecated Files (DO NOT USE)

These files have been removed (use ConfigurationManager instead):
- `src/backend/constants/costs.ts` - REMOVED
- `src/backend/constants/validationMessages.ts` - REMOVED

### Migration Examples

```typescript
// ❌ OLD - Deprecated
import { POINT_LIMITS, TROOPER_LIMITS } from '../constants/costs.js';
import { VALIDATION_MESSAGES } from '../constants/validationMessages.js';

const limit = POINT_LIMITS.STANDARD_LIMIT;
const trooperLimit = TROOPER_LIMITS.STANDARD_LIMIT;
const message = VALIDATION_MESSAGES.WARBAND_NAME_REQUIRED;
```

```typescript
// ✅ NEW - Configuration system
import { ConfigurationManager } from '../config/ConfigurationManager.js';

const configManager = ConfigurationManager.getInstance();
const costConfig = configManager.getCostConfig();
const validationConfig = configManager.getValidationConfig();

const limit = costConfig.pointLimits.standard;
const trooperLimit = costConfig.trooperLimits.standardLimit;
const message = validationConfig.messages.warbandNameRequired;
```

## Configuration Validation and Error Handling

### Validation Results

```typescript
const configManager = ConfigurationManager.getInstance();
await configManager.initialize();

const validation = configManager.validate();
if (!validation.valid) {
  console.error('Configuration errors:');
  validation.errors.forEach(error => {
    console.error(`- ${error.field}: ${error.message}`);
    if (error.suggestions) {
      error.suggestions.forEach(suggestion => {
        console.error(`  Suggestion: ${suggestion}`);
      });
    }
  });
}

if (validation.warnings.length > 0) {
  console.warn('Configuration warnings:');
  validation.warnings.forEach(warning => {
    console.warn(`- ${warning.field}: ${warning.message}`);
  });
}
```

### Error Handling

```typescript
try {
  const configManager = ConfigurationManager.getInstance();
  await configManager.initialize();
  
  // Use configuration...
} catch (error) {
  if (error instanceof ConfigurationError) {
    console.error('Configuration error:', error.message);
  } else if (error instanceof ValidationError) {
    console.error('Validation error:', error.message);
  } else if (error instanceof EnvironmentError) {
    console.error('Environment error:', error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Testing with Configuration

### Test Configuration

```typescript
// In test files
import { ConfigurationManager } from '../config/ConfigurationManager.js';

describe('MyService', () => {
  let configManager: ConfigurationManager;

  beforeEach(async () => {
    configManager = ConfigurationManager.getInstance();
    await configManager.initialize();
  });

  it('should use configuration values', () => {
    const costConfig = configManager.getCostConfig();
    const service = new MyService();
    
    // Test using actual configuration values
    expect(service.getPointLimit()).toBe(costConfig.pointLimits.standard);
  });
});
```

### Environment-Specific Testing

```typescript
// Test with specific environment variables
process.env.POINT_LIMIT_STANDARD = '100';
process.env.NODE_ENV = 'test';

const configManager = ConfigurationManager.getInstance();
await configManager.initialize();

const costConfig = configManager.getCostConfig();
expect(costConfig.pointLimits.standard).toBe(100);
```

## Code Review Checklist

When reviewing backend/business logic code, ensure:

- [ ] No magic numbers or hard-coded backend constants
- [ ] All business logic configuration values use ConfigurationManager
- [ ] Proper initialization of ConfigurationManager
- [ ] Environment variables are documented
- [ ] Error handling for configuration failures
- [ ] Tests use configuration system appropriately
- [ ] No imports from deprecated constants files
- [ ] Cache instances use configuration factory methods
- [ ] UI design constants use CSS custom properties (not ConfigurationManager)
- [ ] Clear separation between backend config and UI design tokens

## Benefits of This System

1. **Centralized Management:** All backend configuration in one place
2. **Environment Flexibility:** Easy environment-specific overrides
3. **Type Safety:** Full TypeScript support with validation
4. **Validation:** Comprehensive validation with helpful error messages
5. **Migration Support:** Automatic migration from legacy formats
6. **Fallback Behavior:** Graceful degradation when configuration fails
7. **Testing Support:** Easy configuration mocking and overrides
8. **Documentation:** Self-documenting through TypeScript interfaces
9. **Clear Separation:** Distinct from UI design tokens for maintainability

## Related Documentation

- **UI Design System Standards:** For visual design constants (colors, spacing, typography)
- **UI Design System Guide:** `docs/UI-DESIGN-SYSTEM.md` - Complete implementation guide
- **Configuration vs Design Tokens:** Use ConfigurationManager for backend, CSS custom properties for UI
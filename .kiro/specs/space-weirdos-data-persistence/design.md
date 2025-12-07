# Design Document: Space Weirdos Data Persistence

## Overview

This design document specifies the data persistence layer for the Space Weirdos Warband Builder. The system provides reliable storage and retrieval of warband data using a dual-layer architecture: an in-memory cache for fast access and JSON file persistence for durability.

The persistence layer is designed to be independent of the UI and can be implemented as a standalone service. It depends on the data model definitions from the game rules spec but has no dependencies on UI components.

**Key Design Goals:**
- Fast retrieval through in-memory caching
- Reliable persistence through JSON file storage
- Graceful error handling for file I/O operations
- Data integrity through validation
- Complete serialization/deserialization of all warband data

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                    Application Layer                     │
│              (WarbandService, API Routes)                │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   Data Repository                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │           In-Memory Cache (Map)                   │  │
│  │     Key: UUID → Value: Warband Object            │  │
│  └──────────────────────────────────────────────────┘  │
│                         │                                │
│                         ▼                                │
│  ┌──────────────────────────────────────────────────┐  │
│  │         File Persistence Layer                    │  │
│  │    (Node.js fs/promises, JSON serialization)     │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Filesystem (data/warbands.json)             │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

**Save Operation:**
1. Application calls `saveWarband(warband)`
2. Repository assigns UUID if new warband
3. Repository validates warband data
4. Repository updates in-memory cache
5. Repository serializes to JSON
6. Repository writes to file asynchronously
7. Returns success/error to application

**Load Operation:**
1. Application calls `getWarband(id)`
2. Repository checks in-memory cache
3. Returns warband from cache (fast path)
4. If not in cache, returns null

**List Operation:**
1. Application calls `getAllWarbands()`
2. Repository returns all warbands from in-memory cache
3. Computes summary information (costs, counts)

**Delete Operation:**
1. Application calls `deleteWarband(id)`
2. Repository removes from in-memory cache
3. Repository persists deletion to file
4. Returns success/error to application

## Components and Interfaces

### DataRepository Class

The `DataRepository` class is the primary interface for all persistence operations.

```typescript
interface DataRepository {
  // Initialization
  initialize(): Promise<void>;
  
  // CRUD Operations
  saveWarband(warband: Warband): Promise<string>; // Returns UUID
  getWarband(id: string): Warband | null;
  getAllWarbands(): WarbandSummary[];
  deleteWarband(id: string): Promise<boolean>;
  
  // Utility
  warbandExists(id: string): boolean;
}
```

**Design Rationale:**
- `initialize()` loads existing data from file into memory on startup
- `saveWarband()` handles both create and update operations
- `getWarband()` is synchronous since it reads from memory
- `getAllWarbands()` returns summaries to avoid exposing full warband objects
- `deleteWarband()` is async to ensure file persistence completes

### Data Models

```typescript
interface Warband {
  id: string; // UUID
  name: string;
  ability: string;
  pointLimit: 75 | 125;
  weirdos: Weirdo[];
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

interface Weirdo {
  id: string; // UUID
  name: string;
  type: 'leader' | 'trooper';
  attributes: Attributes;
  rangedWeapons: RangedWeapon[];
  closeCombatWeapons: CloseCombatWeapon[];
  equipment: Equipment[];
  psychicPowers: PsychicPower[];
  leaderTrait?: string;
  notes?: string;
}

interface WarbandSummary {
  id: string;
  name: string;
  ability: string;
  pointLimit: number;
  totalCost: number;
  weirdoCount: number;
  updatedAt: string;
}
```

**Design Rationale:**
- UUIDs provide globally unique identifiers
- ISO 8601 timestamps enable sorting and display
- `WarbandSummary` provides list view data without full warband details
- All fields from requirements are included in the data model

### File Storage Format

**File Location:** `data/warbands.json`

**JSON Structure:**
```json
{
  "version": "1.0",
  "warbands": {
    "uuid-1": { ...warband object... },
    "uuid-2": { ...warband object... }
  }
}
```

**Design Rationale:**
- Object structure (not array) enables O(1) lookup by ID
- Version field supports future migration strategies
- Single file simplifies backup and deployment
- Human-readable JSON enables manual inspection/editing

### Validation

The repository performs validation before saving:

```typescript
interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

interface ValidationError {
  field: string;
  message: string;
}
```

**Validation Rules:**
- Warband name must be non-empty
- Point limit must be 75 or 125
- All weirdos must have required fields (name, type, attributes)
- Warband ability must be non-empty
- All IDs must be valid UUIDs

**Design Rationale:**
- Validation at persistence layer ensures data integrity
- Validation errors are descriptive for debugging
- Invalid data is rejected before corrupting storage

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Serialization round trip preserves data

*For any* valid warband object, serializing to JSON and then deserializing should produce an equivalent warband with all fields intact.

**Validates: Requirements 9.1, 9.2**

### Property 2: Save then load returns same warband

*For any* valid warband, saving it to the repository and then loading it by ID should return a warband equivalent to the original.

**Validates: Requirements 1.1-1.12, 3.1-3.11**

### Property 3: Special characters are preserved

*For any* warband with special characters (quotes, newlines, unicode) in string fields, saving and loading should preserve those characters exactly.

**Validates: Requirements 9.3, 9.4**

### Property 4: Unique identifiers are always unique

*For any* set of warbands saved to the repository, all warband IDs should be distinct from each other.

**Validates: Requirements 2.1, 2.3**

### Property 5: Delete removes warband completely

*For any* warband that exists in the repository, deleting it by ID should result in subsequent load attempts returning null.

**Validates: Requirements 6.1, 6.4**

### Property 6: List includes all saved warbands

*For any* set of warbands saved to the repository, calling getAllWarbands() should return summaries for exactly those warbands.

**Validates: Requirements 5.1-5.7**

### Property 7: Invalid data is rejected

*For any* warband object with invalid point limit (not 75 or 125), attempting to save should return a validation error.

**Validates: Requirements 4.2**

### Property 8: Timestamp format is ISO 8601

*For any* warband saved to the repository, the createdAt and updatedAt fields should be valid ISO 8601 formatted strings.

**Validates: Requirements 9.5, 9.6**

### Property 9: In-memory cache stays synchronized

*For any* sequence of save and delete operations, the in-memory cache should always match what would be loaded from the JSON file.

**Validates: Requirements 7.2, 7.3, 7.5**

### Property 10: Cost calculations are consistent

*For any* warband, the totalCost in the WarbandSummary should equal the sum of all weirdo costs.

**Validates: Requirements 5.6**

## Error Handling

### Error Types

```typescript
class PersistenceError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public details?: any
  ) {
    super(message);
    this.name = 'PersistenceError';
  }
}

enum ErrorCode {
  FILE_READ_ERROR = 'FILE_READ_ERROR',
  FILE_WRITE_ERROR = 'FILE_WRITE_ERROR',
  JSON_PARSE_ERROR = 'JSON_PARSE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  PERMISSION_ERROR = 'PERMISSION_ERROR'
}
```

### Error Handling Strategy

**File Read Errors:**
- Log error details
- Return descriptive error to caller
- Do not crash application
- If file doesn't exist on startup, create empty storage

**File Write Errors:**
- Log error details
- Return error to caller
- Keep in-memory cache intact
- Retry write operation once

**JSON Parse Errors:**
- Log corrupted data
- Return error indicating data corruption
- Suggest backup restoration
- Do not overwrite corrupted file

**Validation Errors:**
- Return detailed validation errors
- Do not modify storage
- Allow caller to fix and retry

**Permission Errors:**
- Return clear error message
- Suggest checking file permissions
- Do not retry automatically

**Design Rationale:**
- Errors are typed for programmatic handling
- Detailed error messages aid debugging
- System remains stable despite I/O failures
- In-memory cache protects against data loss

## Testing Strategy

### Unit Testing

Unit tests will verify specific behaviors and edge cases:

**DataRepository Tests:**
- Initialize with empty file
- Initialize with existing data
- Save new warband assigns UUID
- Save existing warband updates data
- Load non-existent warband returns null
- Delete non-existent warband returns false
- getAllWarbands returns empty array when no warbands exist

**Serialization Tests:**
- Serialize warband with all fields populated
- Serialize warband with optional fields missing
- Deserialize valid JSON
- Deserialize JSON with missing fields fails validation
- Special characters in names are escaped/unescaped correctly

**Validation Tests:**
- Valid warband passes validation
- Warband with invalid point limit fails validation
- Warband with empty name fails validation
- Warband with missing required fields fails validation

**Error Handling Tests:**
- File read error returns appropriate error
- File write error returns appropriate error
- JSON parse error returns appropriate error
- Permission error returns appropriate error

### Property-Based Testing

Property-based tests will verify universal properties across many inputs using the **fast-check** library. Each test will run a minimum of **50 iterations**.

**Test Configuration:**
```typescript
import fc from 'fast-check';

// Minimum 50 iterations per property test
const testConfig = { numRuns: 50 };
```

**Property Test Implementations:**

Each correctness property listed above will be implemented as a property-based test:

1. **Property 1**: Generate random valid warbands, serialize/deserialize, verify equality
2. **Property 2**: Generate random warbands, save/load, verify equality
3. **Property 3**: Generate warbands with special characters, save/load, verify preservation
4. **Property 4**: Generate multiple warbands, verify all IDs are unique
5. **Property 5**: Generate warband, save, delete, verify load returns null
6. **Property 6**: Generate set of warbands, save all, verify list contains all
7. **Property 7**: Generate warbands with invalid point limits, verify rejection
8. **Property 8**: Generate warbands, save, verify timestamps are ISO 8601
9. **Property 9**: Generate sequence of operations, verify cache matches file
10. **Property 10**: Generate warbands, verify summary cost equals sum of weirdo costs

**Generator Strategy:**

Smart generators will constrain inputs to valid ranges:

```typescript
// Warband generator
const warbandArbitrary = fc.record({
  name: fc.string({ minLength: 1, maxLength: 100 }),
  ability: fc.string({ minLength: 1, maxLength: 100 }),
  pointLimit: fc.constantFrom(75, 125),
  weirdos: fc.array(weirdoArbitrary, { minLength: 1, maxLength: 10 })
});

// Special characters generator for Property 3
const specialCharsArbitrary = fc.string({
  minLength: 1,
  maxLength: 50
}).filter(s => /["'\n\r\t\\]/.test(s));
```

**Test Annotations:**

Each property-based test will be tagged with a comment linking it to the design document:

```typescript
// **Feature: space-weirdos-data-persistence, Property 1: Serialization round trip preserves data**
test('serialization round trip preserves data', () => {
  fc.assert(
    fc.property(warbandArbitrary, (warband) => {
      const json = JSON.stringify(warband);
      const deserialized = JSON.parse(json);
      expect(deserialized).toEqual(warband);
    }),
    testConfig
  );
});
```

### Integration Testing

Integration tests will verify the complete flow:

- Save warband → restart application → load warband
- Save multiple warbands → list all → verify count and summaries
- Save warband → delete warband → verify file updated
- Corrupt JSON file → initialize repository → verify error handling

**Design Rationale:**
- Unit tests catch specific bugs in individual functions
- Property tests verify correctness across wide input ranges
- Integration tests verify end-to-end functionality
- Together they provide comprehensive coverage

## Implementation Notes

### UUID Generation

Use Node.js built-in `crypto.randomUUID()` for UUID generation:

```typescript
import { randomUUID } from 'crypto';

function generateId(): string {
  return randomUUID();
}
```

### File I/O

Use Node.js `fs/promises` API for async file operations:

```typescript
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';

async function loadFromFile(): Promise<StorageData> {
  const data = await readFile(STORAGE_PATH, 'utf-8');
  return JSON.parse(data);
}

async function saveToFile(data: StorageData): Promise<void> {
  await writeFile(STORAGE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}
```

### In-Memory Cache

Use JavaScript `Map` for O(1) lookup performance:

```typescript
private cache: Map<string, Warband> = new Map();

getWarband(id: string): Warband | null {
  return this.cache.get(id) ?? null;
}

saveWarband(warband: Warband): void {
  this.cache.set(warband.id, warband);
}
```

### Async Persistence

File writes are async but don't block the caller:

```typescript
async saveWarband(warband: Warband): Promise<string> {
  // Validate
  const validation = this.validate(warband);
  if (!validation.isValid) {
    throw new PersistenceError('Validation failed', ErrorCode.VALIDATION_ERROR, validation.errors);
  }
  
  // Assign ID if new
  if (!warband.id) {
    warband.id = generateId();
    warband.createdAt = new Date().toISOString();
  }
  warband.updatedAt = new Date().toISOString();
  
  // Update cache (synchronous)
  this.cache.set(warband.id, warband);
  
  // Persist to file (asynchronous)
  await this.persistToFile();
  
  return warband.id;
}
```

### Directory Creation

Ensure storage directory exists on initialization:

```typescript
async initialize(): Promise<void> {
  const dir = path.dirname(STORAGE_PATH);
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
  
  if (existsSync(STORAGE_PATH)) {
    await this.loadFromFile();
  } else {
    // Initialize with empty storage
    await this.saveToFile({ version: '1.0', warbands: {} });
  }
}
```

## Dependencies

### External Dependencies

- **Node.js fs/promises**: File I/O operations
- **Node.js crypto**: UUID generation
- **Node.js path**: Path manipulation

### Internal Dependencies

- **Game Rules Spec**: Data model definitions (Warband, Weirdo, Attributes, etc.)
- **Cost Engine**: For calculating totalCost in WarbandSummary

### No Dependencies On

- UI Components
- API Routes (repository is used by routes, not dependent on them)
- Frontend code

**Design Rationale:**
- Minimal external dependencies reduce complexity
- Standard Node.js modules are stable and well-tested
- Clear dependency boundaries enable independent development

## Performance Considerations

### In-Memory Cache Benefits

- O(1) lookup time for `getWarband()`
- O(n) time for `getAllWarbands()` where n is number of warbands
- No file I/O on read operations

### File I/O Optimization

- Async writes don't block application
- Single file write per save operation
- JSON formatting with 2-space indent balances readability and size

### Scalability

**Expected Load:**
- Typical user: 10-50 warbands
- Power user: 100-200 warbands
- File size: ~5-10 KB per warband
- Total file size: 500 KB - 2 MB for power users

**Performance Targets:**
- Load all warbands on startup: < 100ms
- Save warband: < 50ms
- Get warband from cache: < 1ms
- List all warbands: < 10ms

**Design Rationale:**
- In-memory cache provides excellent read performance
- Single JSON file is simple and sufficient for expected scale
- If scale increases significantly, can migrate to database without changing interface

## Future Enhancements

### Potential Improvements

1. **Backup Strategy**: Automatic backups before writes
2. **Migration System**: Version-aware data migration
3. **Compression**: Gzip compression for large files
4. **Incremental Writes**: Only write changed warbands
5. **Export/Import**: Export warbands to separate files
6. **Cloud Sync**: Sync warbands across devices

### Migration Path

If moving to a database:
- Keep `DataRepository` interface unchanged
- Implement new `DatabaseRepository` class
- Swap implementation without changing callers
- Migrate data using export/import functionality

**Design Rationale:**
- Interface-based design enables future flexibility
- Current implementation is simple and sufficient
- Clear migration path if requirements change

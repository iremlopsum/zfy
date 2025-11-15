# Test Documentation

This directory contains comprehensive tests for the zfy library.

## Test Structure

```
__tests__/
├── core/                          # Core functionality tests
│   ├── create-store.test.ts       # Store creation and middleware
│   ├── init-stores.test.ts        # Multi-store initialization
│   ├── PersistGate.test.tsx       # React component testing
│   └── use-rehydrate.test.ts      # Hook testing
├── internals/                     # Internal module tests
│   ├── invariant.test.ts          # Error handling
│   ├── validations.test.ts        # Input validation
│   └── middlewares/               # Middleware tests
│       ├── create-middlewares.test.ts
│       ├── logger-middleware.test.ts
│       ├── persist-middleware.test.ts
│       └── subscribe-middleware.test.ts
├── performance/                   # Performance and stress tests
│   └── store-performance.test.ts
├── utils/                         # Test utilities
│   └── test-helpers.ts
└── index.ts                       # Shared test fixtures

```

## Test Categories

### Unit Tests (117 tests)

Tests for individual functions and modules in isolation.

- **Invariant & Error Handling** (21 tests): InvariantError class and error throwing
- **Validations** (30 tests): Input validation for all public APIs
- **Middlewares** (50 tests): Logger, persist, subscribe middleware functionality
- **Middleware Composition** (19 tests): How middlewares work together

### Integration Tests (23 tests)

Tests for core store functionality and combinations of features.

- **Create Store** (23 tests): Store creation, middleware integration, error scenarios
- **Init Stores** (15 tests): Multi-store management, rehydration, reset functionality

### Component Tests (17 tests)

Tests for React components and hooks.

- **PersistGate** (17 tests): Component rendering, loader states, error handling
- **useRehydrate** (17 tests): Hook behavior, edge cases, cleanup

### Edge Case Tests (48 tests)

Tests for error scenarios, edge cases, and concurrent operations.

- **Storage Failures** (9 tests): Read/write/remove errors, quota exceeded
- **Concurrent Operations** (8 tests): Race conditions, rapid updates
- **Multiple Stores** (various): Complex multi-store scenarios

### Performance Tests (15 tests)

Tests for performance characteristics and stress testing.

- **Store Operations**: Creation, updates, reads, resets
- **Stress Tests**: Extreme load, large state, deep nesting

## Test Utilities

### Test Helpers (`utils/test-helpers.ts`)

#### Storage Helpers

```typescript
createFailingStorage(operation) // Create storage that fails on specific operations
createQuotaExceededStorage() // Create storage that throws quota errors
createCorruptedStorage(type) // Create storage with corrupted data
```

#### Store Helpers

```typescript
createTestStore(name, data, options) // Quick store creation with options
expectStoreToHaveState(store, state) // Assert partial state match
expectStoreToHaveMethods(store) // Verify store has required methods
```

#### Console Mocking

```typescript
const { mocks, restore } = mockConsole() // Mock all console methods
// Use mocks.group, mocks.debug, etc.
restore() // Clean up mocks
```

#### Performance Helpers

```typescript
await measureExecutionTime(fn) // Measure function execution time
await runMultipleTimes(fn, times) // Run function multiple times
calculateStats(values) // Calculate mean, median, min, max
```

#### State Manipulation

```typescript
bulkUpdate(store, updates) // Update multiple properties
const snapshot = createStoreSnapshot(store) // Save state snapshot
restoreStoreSnapshot(store, snapshot) // Restore from snapshot
```

## Running Tests

```bash
# Run all tests
yarn test

# Run specific test file
yarn test create-store.test.ts

# Run tests in watch mode
yarn test --watch

# Run tests with coverage
yarn test --coverage

# Run only performance tests
yarn test performance

# Run only unit tests
yarn test internals
```

## Writing Tests

### Best Practices

1. **Use descriptive test names**

   ```typescript
   ✅ it('handles storage getItem throwing error', ...)
   ❌ it('storage error', ...)
   ```

2. **Organize with nested describes**

   ```typescript
   describe('createStore', () => {
     describe('validation', () => {
       it('throws error when name is missing', ...)
     })
     describe('middleware', () => {
       it('applies logger middleware', ...)
     })
   })
   ```

3. **Use test utilities to reduce duplication**

   ```typescript
   const { mocks, restore } = mockConsole()
   // ... test code ...
   restore()
   ```

4. **Clean up after tests**

   ```typescript
   afterEach(() => {
     // Restore mocks
     // Clear storage
     // Reset state
   })
   ```

5. **Test edge cases explicitly**

   ```typescript
   it('handles null storage returns', ...)
   it('handles undefined storage returns', ...)
   it('handles malformed JSON', ...)
   ```

6. **Use waitFor for async operations**

   ```typescript
   await waitFor(() => {
     expect(condition).toBeTruthy()
   })
   ```

7. **Avoid expect.assertions()**
   - They make tests brittle
   - Natural test flow is clearer

## Test Coverage Goals

- **Unit Tests**: 100% coverage of internal modules
- **Integration Tests**: All feature combinations tested
- **Edge Cases**: All error paths covered
- **Performance**: Key operations benchmarked

## Common Patterns

### Testing Store Creation

```typescript
const store = createStore('test', { value: 1 })
expect(store.getState().data.value).toBe(1)
expectStoreToHaveMethods(store)
```

### Testing Persistence

```typescript
const store = createStore('test', data, {
  persist: { storage: createJSONStorage(() => SyncStorage) },
})
expect(store.getState().data).toEqual(rehydratedData)
```

### Testing Errors

```typescript
const consoleError = jest.spyOn(console, 'error').mockImplementation()
expect(() => {
  createStore('', data) // Invalid input
}).toThrow('Expected error message')
consoleError.mockRestore()
```

### Testing Async Operations

```typescript
await waitFor(
  () => {
    expect(store.getState().data).toEqual(expected)
  },
  { timeout: 500 }
)
```

### Testing Concurrent Operations

```typescript
act(() => {
  store1.getState().update(...)
  store2.getState().update(...)
  stores.reset()
})
```

## Snapshot Testing

Snapshots are used for:

- PersistGate component output
- Complex object structures

Update snapshots with:

```bash
yarn test -u
```

Review snapshot changes carefully before committing.

## Performance Testing

Performance tests use:

- `measureExecutionTime()` for timing
- `runMultipleTimes()` for consistency
- `calculateStats()` for analysis

Thresholds are set conservatively to avoid flaky tests:

- Store creation: < 10ms
- State updates: < 5ms
- 1000 updates: < 100ms

## Continuous Integration

Tests run automatically on:

- Every commit (pre-commit hook)
- Every push
- Pull requests

All tests must pass before merging.

## Debugging Tests

### Run specific test

```bash
yarn test -t "test name pattern"
```

### Debug in VS Code

Add breakpoints and use Jest debugging configuration.

### Verbose output

```bash
yarn test --verbose
```

### See console output

Remove `mockImplementation()` from console spies temporarily.

## Contributing

When adding new tests:

1. Follow existing patterns
2. Use test utilities where applicable
3. Add documentation for new utilities
4. Update this README if needed
5. Ensure all tests pass
6. Check TypeScript and linting errors

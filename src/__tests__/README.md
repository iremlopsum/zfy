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
├── integration/                   # Real-world integration tests
│   └── real-world-scenarios.test.tsx
├── advanced/                      # Advanced scenario tests
│   └── memory-and-performance.test.ts
├── performance/                   # Performance and stress tests
│   └── store-performance.test.ts
├── coverage/                      # Coverage goals and analysis
│   └── coverage-goals.md
├── utils/                         # Test utilities
│   └── test-helpers.ts
└── index.ts                       # Shared test fixtures

```

## Test Categories

### Unit Tests (117 tests)

Tests for individual functions and modules in isolation.

- **Invariant & Error Handling** (27 tests): InvariantError class and error throwing
- **Validations** (94 tests): Input validation for all public APIs
- **Middlewares** (39 tests): Logger, persist, subscribe middleware functionality
- **Middleware Composition** (19 tests): How middlewares work together

### Core Tests (72 tests)

Tests for core store functionality and combinations of features.

- **Create Store** (23 tests): Store creation, middleware integration, error scenarios
- **Init Stores** (15 tests): Multi-store management, rehydration, reset functionality
- **PersistGate** (17 tests): Component rendering, loader states, error handling
- **useRehydrate** (17 tests): Hook behavior, edge cases, cleanup

### Integration Tests (10 tests)

Tests for real-world usage patterns and complex scenarios.

- **Multi-Store Applications** (2 tests): Auth flows, form state management
- **Data Fetching & Caching** (2 tests): Cache patterns, optimistic updates
- **Component Lifecycle** (2 tests): Mount/unmount, async operations
- **PersistGate Scenarios** (2 tests): Navigation, multi-step wizards
- **Error Recovery** (2 tests): Corruption recovery, conflict resolution

### Advanced Tests (14 tests)

Tests for memory leaks, performance degradation, and edge cases.

- **Memory Leak Detection** (3 tests): Subscription cleanup, store lifecycle
- **Performance Degradation** (3 tests): Long-running stability
- **Long-Running Scenarios** (2 tests): Thousands of operations
- **Edge Case Resilience** (4 tests): Circular refs, deep nesting, error recovery
- **Concurrent Access** (2 tests): High-frequency operations, interleaved updates

### Performance & Stress Tests (16 tests)

Benchmarks and stress tests with performance thresholds.

- **Store Operations** (8 tests): Creation, updates, reads, resets
- **Stress Tests** (4 tests): Extreme load, large state, deep nesting
- **Memory Efficiency** (1 test): Memory leak detection
- **Multi-Store Performance** (3 tests): Multiple stores, subscriptions

**Total: 213 tests**

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

// Or using the store hook selector (cleaner API):
const value = store((data) => data.value)
expect(value).toBe(1)
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

## Test Evolution

This test suite has evolved through multiple improvement phases:

### Phase 1: Critical Issues & Unit Tests

- Fixed `act()` warnings in React component tests
- Added comprehensive unit tests for internal modules
- 117 tests → Established foundation

### Phase 2: Test Quality & Consistency

- Removed brittle `expect.assertions()` calls
- Standardized mock cleanup patterns
- Improved test organization with `describe` blocks
- Enhanced test descriptions for clarity

### Phase 3: Edge Cases & Coverage

- Added storage failure scenarios
- Implemented concurrent operation tests
- Expanded component and hook test coverage
- Added validation error tests
- 173 tests → Robust error handling

### Phase 4: Test Utilities & Performance

- Created reusable test helper library
- Added 16 performance and stress tests
- Implemented memory leak detection
- Documented entire test suite
- 189 tests → Performance benchmarks

### Phase 5: Integration & Advanced Scenarios

- Added 10 real-world integration tests
- Implemented 14 advanced scenario tests
- Added test coverage configuration
- Optimized test reliability
- **213 tests → Production-ready**

## Contributing

When adding new tests:

1. Follow existing patterns
2. Use test utilities where applicable
3. Add documentation for new utilities
4. Update this README if needed
5. Ensure all tests pass
6. Check TypeScript and linting errors
7. Maintain or improve test coverage
8. Consider performance implications

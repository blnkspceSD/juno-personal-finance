# Performance Optimization Guide

This document outlines the performance optimizations implemented in the Juno real-time balance updates system and best practices for maintaining fast compilation and runtime performance.

## Compilation Performance Optimizations

### 1. Lazy-Loaded Singletons
- **RealtimeManager**: Uses `getRealtimeManager()` to avoid instantiation during module load
- **Cache instances**: `getBalanceCache()` and `getMessageDeduplicationCache()` for on-demand loading
- **Error message maps**: Lazy-loaded to prevent heavy object creation during compilation

### 2. Import Optimization
- Avoid barrel exports where possible to reduce bundling overhead
- Use specific imports instead of wildcard imports
- Leverage tree-shaking friendly patterns

### 3. Code Splitting Best Practices
- Real-time functionality is isolated in separate modules
- Utility functions are modular and independently importable
- Type definitions are separated from implementation

## Runtime Performance Optimizations

### 1. Debouncing and Throttling
- **Balance updates**: 50ms debounce prevents excessive re-renders
- **Optimistic updates**: 25ms debounce for rapid UI feedback
- **Rate limiting**: Max 100 updates/second to prevent system overload

### 2. Caching Strategy
- **LRU Cache**: 30-second TTL for balance calculations
- **Message deduplication**: 30-second window to prevent duplicate processing
- **Memoized calculations**: Cached based on envelope state fingerprint

### 3. Network Optimization
- **Batch updates**: Groups rapid changes into single operations
- **Payload compression**: Optimized WebSocket message structure
- **Graceful degradation**: Automatic fallback to polling (5-second interval)

### 4. Memory Management
- **Automatic cleanup**: Subscriptions and timers cleaned up on unmount
- **Cache eviction**: LRU policy prevents unlimited memory growth
- **Connection pooling**: Shared WebSocket connections for multiple subscriptions

## Performance Monitoring

### Key Metrics to Watch
1. **Compilation Time**: Should remain under 2 seconds for most changes
2. **Initial Page Load**: Real-time features should not block rendering
3. **Update Latency**: Balance updates should appear within 100ms
4. **Memory Usage**: Monitor for memory leaks in long-running sessions

### Performance Testing
Run the performance test suite to verify optimizations:
```bash
npm test -- performance-simple
```

### Development Best Practices

1. **Avoid Heavy Initialization**
   ```typescript
   // ❌ Bad - Heavy object created at module load
   export const heavyManager = new HeavyManager()
   
   // ✅ Good - Lazy initialization
   let _manager: HeavyManager | null = null
   export const getManager = () => _manager ??= new HeavyManager()
   ```

2. **Use Debouncing for User Input**
   ```typescript
   // ❌ Bad - Updates on every keystroke
   onChange={handleChange}
   
   // ✅ Good - Debounced updates
   onChange={debouncedHandleChange}
   ```

3. **Optimize React Hook Dependencies**
   ```typescript
   // ❌ Bad - Missing dependencies cause stale closures
   useEffect(() => {
     // Uses stale values
   }, [])
   
   // ✅ Good - Proper dependencies or useCallback
   const stableFunction = useCallback(() => {
     // Fresh values
   }, [dependency])
   
   useEffect(() => {
     stableFunction()
   }, [stableFunction])
   ```

4. **Cache Expensive Calculations**
   ```typescript
   // ❌ Bad - Recalculated on every render
   const expensiveValue = heavyCalculation(props)
   
   // ✅ Good - Memoized calculation
   const expensiveValue = useMemo(() => 
     heavyCalculation(props), [props.key]
   )
   ```

## Troubleshooting Performance Issues

### Slow Compilation
1. Check for circular imports: `npx madge --circular src/`
2. Look for heavy module initialization
3. Verify lazy loading patterns are used

### Slow Runtime Updates
1. Check React DevTools Profiler for unnecessary re-renders
2. Verify debouncing is working correctly
3. Monitor WebSocket connection health

### Memory Leaks
1. Ensure all useEffect cleanup functions are implemented
2. Check that subscriptions are properly unsubscribed
3. Monitor cache size growth over time

## Environment-Specific Optimizations

### Development
- Turbopack enabled for faster rebuilds
- Source maps enabled for debugging
- Hot reload optimized for real-time features

### Production
- Tree shaking eliminates unused code
- Bundle splitting for optimal loading
- Compression and minification applied

### Testing
- Mock heavy dependencies to speed up tests
- Use fake timers for debounce/throttle testing
- Isolate performance-critical paths

## Future Optimization Opportunities

1. **Service Worker**: Offline support and background sync
2. **WebAssembly**: Performance-critical calculations
3. **Edge Computing**: Real-time updates closer to users
4. **Database Optimization**: Query optimization and indexing
5. **CDN Integration**: Static asset optimization

This performance optimization strategy ensures Juno remains fast and responsive even as the codebase grows and user load increases.
// Light-weight performance monitoring script
// Loads after main content to avoid blocking

export function reportWebVitals(metric: any) {
  // Analytics implementation
  console.log(metric);
}

// Check for long tasks
if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      // Report long tasks > 50ms
      if (entry.duration > 50) {
         console.warn('[Long Task]', entry);
      }
    }
  });
  
  try {
    observer.observe({ entryTypes: ['longtask'] });
  } catch (e) {
    // Ignore if not supported
  }
}

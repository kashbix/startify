import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router } from './Router';

// Optimized QueryClient configuration for production
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes by default
      staleTime: 5 * 60 * 1000,
      
      // Keep unused data in cache for 30 minutes
      gcTime: 30 * 60 * 1000,
      
      // Retry failed requests up to 2 times
      retry: 2,
      
      // Exponential backoff for retries
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Don't refetch on window focus in production (reduces API calls)
      refetchOnWindowFocus: false,
      
      // Don't refetch on reconnect automatically
      refetchOnReconnect: 'always',
      
      // Keep previous data while fetching new data (smoother UX)
      placeholderData: (previousData: unknown) => previousData,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  );
}

export default App;

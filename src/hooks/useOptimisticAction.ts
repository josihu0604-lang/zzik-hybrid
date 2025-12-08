
import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast'; // Assuming standard shadcn/ui toast exists

/**
 * Optimistic UI Hook
 * 
 * Immediately updates local state while waiting for async server action.
 * Rolls back on failure.
 * 
 * @param initialData Current server state
 * @param asyncAction Server action promise
 * @param optimisitcUpdateFn Function to calculate optimistic state
 */
export function useOptimisticAction<T, P>(
  initialData: T,
  asyncAction: (payload: P) => Promise<T>,
  optimisticUpdateFn: (current: T, payload: P) => T
) {
  const [data, setData] = useState<T>(initialData);
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();

  const execute = useCallback(async (payload: P) => {
    // 1. Snapshot previous state
    const previousData = data;
    
    // 2. Optimistic Update
    setData((current) => optimisticUpdateFn(current, payload));
    setIsPending(true);

    try {
      // 3. Perform actual server action
      const result = await asyncAction(payload);
      
      // 4. Confirm with server data (or keep optimistic if result matches)
      setData(result);
    } catch (error) {
      // 5. Rollback on failure
      setData(previousData);
      toast({
        title: 'Action Failed',
        description: 'Changes have been reverted.',
        variant: 'destructive'
      });
      console.error(error);
    } finally {
      setIsPending(false);
    }
  }, [data, asyncAction, optimisticUpdateFn, toast]);

  return {
    data,
    execute,
    isPending
  };
}

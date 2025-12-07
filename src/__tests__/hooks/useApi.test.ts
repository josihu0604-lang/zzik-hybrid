import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useApi, useMutation, useApiPost, useApiPut, useApiDelete } from '@/hooks/useApi';
import { apiClient, ApiException } from '@/lib/api-client';

// Mock api-client
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    request: vi.fn(),
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  ApiException: class ApiException extends Error {
    status: number;
    data?: unknown;

    constructor(options: { message: string; status: number; data?: unknown }) {
      super(options.message);
      this.status = options.status;
      this.data = options.data;
    }
  },
}));

describe('useApi - Basic Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with default state', () => {
    vi.mocked(apiClient.request).mockResolvedValue({
      data: null,
      status: 200,
      headers: new Headers(),
    });

    const { result } = renderHook(() => useApi('/test', { immediate: false }));

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoaded).toBe(false);
  });

  it('should initialize with initial data', () => {
    vi.mocked(apiClient.request).mockResolvedValue({
      data: null,
      status: 200,
      headers: new Headers(),
    });

    const initialData = { id: 1, name: 'Test' };
    const { result } = renderHook(() => useApi('/test', { immediate: false, initialData }));

    expect(result.current.data).toEqual(initialData);
  });
});

describe('useApi - Immediate Fetch', () => {
  it('should fetch immediately by default', async () => {
    const mockData = { id: 1, name: 'Test' };
    vi.mocked(apiClient.request).mockResolvedValue({
      data: mockData,
      status: 200,
      headers: new Headers(),
    });

    const { result } = renderHook(() => useApi('/test'));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.isLoaded).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should not fetch when immediate=false', () => {
    vi.mocked(apiClient.request).mockResolvedValue({
      data: null,
      status: 200,
      headers: new Headers(),
    });

    const { result } = renderHook(() => useApi('/test', { immediate: false }));

    expect(result.current.isLoading).toBe(false);
    expect(apiClient.request).not.toHaveBeenCalled();
  });
});

describe('useApi - Data Fetching', () => {
  it('should fetch data successfully', async () => {
    const mockData = { users: [{ id: 1, name: 'Alice' }] };
    vi.mocked(apiClient.request).mockResolvedValue({
      data: mockData,
      status: 200,
      headers: new Headers(),
    });

    const { result } = renderHook(() => useApi('/users', { immediate: false }));

    await act(async () => {
      await result.current.fetch();
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.isLoaded).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should handle API errors', async () => {
    const mockError = new ApiException({
      message: 'Not found',
      status: 404,
    });

    vi.mocked(apiClient.request).mockRejectedValue(mockError);

    const { result } = renderHook(() => useApi('/test', { immediate: false }));

    await act(async () => {
      await result.current.fetch();
    });

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toEqual(mockError);
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle network errors', async () => {
    const networkError = new Error('Network error');
    vi.mocked(apiClient.request).mockRejectedValue(networkError);

    const { result } = renderHook(() => useApi('/test', { immediate: false }));

    await act(async () => {
      await result.current.fetch();
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toBe('Network error');
  });
});

describe('useApi - Transform Data', () => {
  it('should transform response data', async () => {
    const mockData = { count: 5 };
    vi.mocked(apiClient.request).mockResolvedValue({
      data: mockData,
      status: 200,
      headers: new Headers(),
    });

    const transform = (data: { count: number }) => ({
      ...data,
      doubled: data.count * 2,
    });

    const { result } = renderHook(() =>
      useApi('/test', {
        immediate: false,
        transform,
      })
    );

    await act(async () => {
      await result.current.fetch();
    });

    expect(result.current.data).toEqual({ count: 5, doubled: 10 });
  });
});

describe('useApi - Callbacks', () => {
  it('should call onSuccess callback', async () => {
    const mockData = { success: true };
    vi.mocked(apiClient.request).mockResolvedValue({
      data: mockData,
      status: 200,
      headers: new Headers(),
    });

    const onSuccess = vi.fn();

    const { result } = renderHook(() =>
      useApi('/test', {
        immediate: false,
        onSuccess,
      })
    );

    await act(async () => {
      await result.current.fetch();
    });

    expect(onSuccess).toHaveBeenCalledWith(mockData);
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('should call onError callback', async () => {
    const mockError = new ApiException({
      message: 'Server error',
      status: 500,
    });

    vi.mocked(apiClient.request).mockRejectedValue(mockError);

    const onError = vi.fn();

    const { result } = renderHook(() =>
      useApi('/test', {
        immediate: false,
        onError,
      })
    );

    await act(async () => {
      await result.current.fetch();
    });

    expect(onError).toHaveBeenCalledWith(mockError);
    expect(onError).toHaveBeenCalledTimes(1);
  });
});

describe('useApi - Refetch Interval', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.skip('should refetch at specified interval', async () => {
    const mockData = { value: 1 };
    vi.mocked(apiClient.request).mockResolvedValue({
      data: mockData,
      status: 200,
      headers: new Headers(),
    });

    const { unmount } = renderHook(() =>
      useApi('/test', {
        immediate: true,
        refetchInterval: 1000,
      })
    );

    await waitFor(
      () => {
        expect(apiClient.request).toHaveBeenCalledTimes(1);
      },
      { timeout: 2000 }
    );

    // Fast forward 1 second
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    await waitFor(
      () => {
        expect(apiClient.request).toHaveBeenCalledTimes(2);
      },
      { timeout: 2000 }
    );

    // Cleanup
    unmount();
  }, 10000);

  it.skip('should not refetch when refetchInterval=0', async () => {
    const mockData = { value: 1 };
    vi.mocked(apiClient.request).mockResolvedValue({
      data: mockData,
      status: 200,
      headers: new Headers(),
    });

    const { unmount } = renderHook(() =>
      useApi('/test', {
        immediate: true,
        refetchInterval: 0,
      })
    );

    await waitFor(
      () => {
        expect(apiClient.request).toHaveBeenCalledTimes(1);
      },
      { timeout: 2000 }
    );

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(apiClient.request).toHaveBeenCalledTimes(1);

    // Cleanup
    unmount();
  }, 10000);
});

describe('useApi - Manual Data Updates', () => {
  it('should set data manually', () => {
    vi.mocked(apiClient.request).mockResolvedValue({
      data: null,
      status: 200,
      headers: new Headers(),
    });

    const { result } = renderHook(() => useApi('/test', { immediate: false }));

    act(() => {
      result.current.setData({ id: 1, name: 'Manual' });
    });

    expect(result.current.data).toEqual({ id: 1, name: 'Manual' });
  });

  it('should set data with updater function', () => {
    vi.mocked(apiClient.request).mockResolvedValue({
      data: null,
      status: 200,
      headers: new Headers(),
    });

    const { result } = renderHook(() =>
      useApi('/test', {
        immediate: false,
        initialData: { count: 5 },
      })
    );

    act(() => {
      result.current.setData((prev) => ({
        count: (prev?.count || 0) + 1,
      }));
    });

    expect(result.current.data).toEqual({ count: 6 });
  });
});

describe('useApi - Reset', () => {
  it('should reset to initial state', async () => {
    const mockData = { id: 1 };
    vi.mocked(apiClient.request).mockResolvedValue({
      data: mockData,
      status: 200,
      headers: new Headers(),
    });

    const initialData = { id: 0 };
    const { result } = renderHook(() =>
      useApi('/test', {
        immediate: false,
        initialData,
      })
    );

    await act(async () => {
      await result.current.fetch();
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.isLoaded).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toEqual(initialData);
    expect(result.current.isLoaded).toBe(false);
    expect(result.current.error).toBeNull();
  });
});

describe('useMutation - Basic Functionality', () => {
  it('should execute mutation', async () => {
    const mockResult = { success: true };
    const mutationFn = vi.fn().mockResolvedValue(mockResult);

    const { result } = renderHook(() => useMutation(mutationFn));

    await act(async () => {
      await result.current.mutate({ name: 'Test' });
    });

    expect(mutationFn).toHaveBeenCalledWith({ name: 'Test' });
    expect(result.current.data).toEqual(mockResult);
    expect(result.current.error).toBeNull();
  });

  it('should handle mutation errors', async () => {
    const mockError = new ApiException({
      message: 'Validation error',
      status: 400,
    });

    const mutationFn = vi.fn().mockRejectedValue(mockError);

    const { result } = renderHook(() => useMutation(mutationFn));

    await act(async () => {
      await result.current.mutate({ name: 'Test' });
    });

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toEqual(mockError);
  });

  it('should call onSuccess callback', async () => {
    const mockResult = { id: 1 };
    const mutationFn = vi.fn().mockResolvedValue(mockResult);
    const onSuccess = vi.fn();

    const { result } = renderHook(() => useMutation(mutationFn, { onSuccess }));

    const variables = { name: 'Test' };

    await act(async () => {
      await result.current.mutate(variables);
    });

    expect(onSuccess).toHaveBeenCalledWith(mockResult, variables);
  });

  it('should call onError callback', async () => {
    const mockError = new ApiException({
      message: 'Error',
      status: 500,
    });

    const mutationFn = vi.fn().mockRejectedValue(mockError);
    const onError = vi.fn();

    const { result } = renderHook(() => useMutation(mutationFn, { onError }));

    const variables = { name: 'Test' };

    await act(async () => {
      await result.current.mutate(variables);
    });

    expect(onError).toHaveBeenCalledWith(mockError, variables);
  });

  it('should call onSettled callback', async () => {
    const mutationFn = vi.fn().mockResolvedValue({ success: true });
    const onSettled = vi.fn();

    const { result } = renderHook(() => useMutation(mutationFn, { onSettled }));

    await act(async () => {
      await result.current.mutate({ name: 'Test' });
    });

    expect(onSettled).toHaveBeenCalled();
  });

  it('should reset mutation state', async () => {
    const mutationFn = vi.fn().mockResolvedValue({ success: true });

    const { result } = renderHook(() => useMutation(mutationFn));

    await act(async () => {
      await result.current.mutate({ name: 'Test' });
    });

    expect(result.current.data).toBeDefined();

    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });
});

describe('useApiPost - Convenience Hook', () => {
  it('should execute POST request', async () => {
    const mockData = { id: 1, created: true };
    vi.mocked(apiClient.post).mockResolvedValue({
      data: mockData,
      status: 200,
      headers: new Headers(),
    });

    const { result } = renderHook(() => useApiPost('/users'));

    await act(async () => {
      await result.current.mutate({ name: 'Alice' });
    });

    expect(apiClient.post).toHaveBeenCalledWith('/users', { name: 'Alice' });
    expect(result.current.data).toEqual(mockData);
  });
});

describe('useApiPut - Convenience Hook', () => {
  it('should execute PUT request', async () => {
    const mockData = { id: 1, updated: true };
    vi.mocked(apiClient.put).mockResolvedValue({
      data: mockData,
      status: 200,
      headers: new Headers(),
    });

    const { result } = renderHook(() => useApiPut('/users/1'));

    await act(async () => {
      await result.current.mutate({ name: 'Updated' });
    });

    expect(apiClient.put).toHaveBeenCalledWith('/users/1', { name: 'Updated' });
    expect(result.current.data).toEqual(mockData);
  });
});

describe('useApiDelete - Convenience Hook', () => {
  it('should execute DELETE request', async () => {
    const mockData = { deleted: true };
    vi.mocked(apiClient.delete).mockResolvedValue({
      data: mockData,
      status: 200,
      headers: new Headers(),
    });

    const { result } = renderHook(() => useApiDelete('/users/1'));

    await act(async () => {
      await result.current.mutate();
    });

    expect(apiClient.delete).toHaveBeenCalledWith('/users/1');
    expect(result.current.data).toEqual(mockData);
  });
});

describe('useApi - Integration Tests', () => {
  it('should complete full CRUD workflow', async () => {
    // GET
    const getResponse = { users: [{ id: 1, name: 'Alice' }] };
    vi.mocked(apiClient.request).mockResolvedValue({
      data: getResponse,
      status: 200,
      headers: new Headers(),
    });

    const { result: getResult } = renderHook(() => useApi('/users'));

    await waitFor(() => {
      expect(getResult.current.data).toEqual(getResponse);
    });

    // POST
    const postResponse = { id: 2, name: 'Bob' };
    vi.mocked(apiClient.post).mockResolvedValue({
      data: postResponse,
      status: 200,
      headers: new Headers(),
    });

    const { result: postResult } = renderHook(() => useApiPost('/users'));

    await act(async () => {
      await postResult.current.mutate({ name: 'Bob' });
    });

    expect(postResult.current.data).toEqual(postResponse);

    // PUT
    const putResponse = { id: 2, name: 'Bob Updated' };
    vi.mocked(apiClient.put).mockResolvedValue({
      data: putResponse,
      status: 200,
      headers: new Headers(),
    });

    const { result: putResult } = renderHook(() => useApiPut('/users/2'));

    await act(async () => {
      await putResult.current.mutate({ name: 'Bob Updated' });
    });

    expect(putResult.current.data).toEqual(putResponse);

    // DELETE
    const deleteResponse = { deleted: true };
    vi.mocked(apiClient.delete).mockResolvedValue({
      data: deleteResponse,
      status: 200,
      headers: new Headers(),
    });

    const { result: deleteResult } = renderHook(() => useApiDelete('/users/2'));

    await act(async () => {
      await deleteResult.current.mutate();
    });

    expect(deleteResult.current.data).toEqual(deleteResponse);
  });
});


import { describe, it, expect } from 'vitest';
import { GET } from '../route';

describe('K-Experience Detail API', () => {
  it('should return experience details', async () => {
    const request = new Request('http://localhost:3000/api/k-experience/exp-1');
    const params = Promise.resolve({ id: 'exp-1' });
    const response = await GET(request, { params });
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data.id).toBe('exp-1');
    expect(data.data.fullDescription).toBeDefined();
  });

  it('should return 404 for invalid id', async () => {
    const request = new Request('http://localhost:3000/api/k-experience/invalid-id');
    const params = Promise.resolve({ id: 'invalid-id' });
    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
  });
});

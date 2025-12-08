
import { describe, it, expect } from 'vitest';
import { GET } from '../route';

describe('K-Experience API', () => {
  it('should return a list of experiences', async () => {
    const request = new Request('http://localhost:3000/api/k-experience');
    const response = await GET(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(Array.isArray(data.data.experiences)).toBe(true);
    expect(data.data.experiences.length).toBeGreaterThan(0);
  });

  it('should filter by category', async () => {
    const request = new Request('http://localhost:3000/api/k-experience?category=kpop');
    const response = await GET(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data.experiences.length).toBeGreaterThan(0);
    data.data.experiences.forEach((exp: any) => {
      expect(exp.category).toBe('kpop');
    });
  });
});

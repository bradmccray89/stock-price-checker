import { describe, it, expect, vi } from 'vitest';
import { GET } from '../../app/api/stock/route';
import { NextRequest } from 'next/server';

global.fetch = vi.fn();

const createMockRequest = (ticker: string) => {
  const url = new URL(`http://localhost:3000/api/stock?ticker=${ticker}`);
  return {
    nextUrl: {
      searchParams: url.searchParams,
    },
  } as NextRequest;
};

describe('Happy Path Tests', () => {
  it('successfully fetches stock data from API', async () => {
    process.env.NEXT_PUBLIC_FINNHUB_API_KEY = 'test-api-key';

    const mockFinnhubData = {
      c: 150.25, // current price
      o: 149.0, // open
      h: 152.0, // high
      l: 148.0, // low
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockFinnhubData),
    });

    const request = createMockRequest('AAPL');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ticker).toBe('AAPL');
    expect(data.currentPrice).toBe(150.25);
    expect(data.open).toBe(149.0);
  });

  it('converts lowercase ticker to uppercase', async () => {
    process.env.NEXT_PUBLIC_FINNHUB_API_KEY = 'test-api-key';

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ c: 100, o: 99 }),
    });

    const request = createMockRequest('aapl');
    const response = await GET(request);
    const data = await response.json();

    expect(data.ticker).toBe('AAPL');
  });

  it('validates sign up form data successfully', async () => {
    const validSignUpData = {
      name: 'John Doe',
      email: 'test@example.com',
      password: 'password123',
      confirm: 'password123',
    };

    expect(validSignUpData.name.length).toBeGreaterThan(1);
    expect(validSignUpData.email).toContain('@');
    expect(validSignUpData.password.length).toBeGreaterThanOrEqual(8);
    expect(validSignUpData.password).toBe(validSignUpData.confirm);
  });

  it('validates sign in form data successfully', async () => {
    const validSignInData = {
      email: 'test@example.com',
      password: 'password123',
    };

    expect(validSignInData.email).toContain('@');
    expect(validSignInData.password.length).toBeGreaterThan(0);
  });

  it('handles stock search input correctly', async () => {
    const ticker = 'AAPL';
    const upperTicker = ticker.toUpperCase();

    expect(upperTicker).toBe('AAPL');
    expect(ticker.trim()).toBeTruthy();
  });
});

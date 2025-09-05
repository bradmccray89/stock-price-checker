'use client';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useState, useEffect } from 'react';

interface StockData {
  ticker: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
}

export default function StocksPage() {
  const router = useRouter();
  const [ticker, setTicker] = useState('');
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/sign-in');
      } else {
        setIsAuthenticated(true);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/sign-in');
      } else {
        setIsAuthenticated(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleTickerInput = async (ticker: string) => {
    if (!ticker.trim()) {
      setError('Please enter a ticker symbol');
      return;
    }

    setLoading(true);
    setError(null);
    setStockData(null);

    try {
      const response = await fetch(
        `/api/stock?ticker=${encodeURIComponent(ticker.toLocaleUpperCase())}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch stock data');
      }

      setStockData(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch stock data'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <main className='relative flex min-h-screen flex-col items-center justify-center p-24'>
      <header className='absolute top-0 left-0 right-0 h-16 flex justify-end items-center px-8'>
        <button
          className='bg-transparent border border-red-500/50 text-white px-4 py-2 rounded-xl hover:bg-red-500/25 hover:border-red-500 cursor-pointer transition duration-200'
          onClick={handleSignOut}>
          Sign Out
        </button>
      </header>
      <h1 className='text-4xl font-bold bg-gradient-to-r from-purple-500 to-sky-500 bg-clip-text text-transparent'>
        Stock Prices
      </h1>
      <p className='text-lg mb-8'>
        Here you can check the stock prices for your favorite companies.
      </p>

      {/* ticker input */}
      <div className='w-full max-w-md'>
        <div className='flex gap-2 mb-4'>
          <input
            type='text'
            placeholder='Enter ticker symbol (e.g., AAPL)'
            className='flex-1 border border-slate-300 dark:border-neutral-700 rounded-lg px-4 py-2 text-sm shadow-sm placeholder:text-slate-400 dark:placeholder:text-neutral-500 bg-white dark:bg-neutral-800'
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleTickerInput(ticker)}
          />
          <button
            className='px-6 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition disabled:opacity-50'
            onClick={() => handleTickerInput(ticker)}
            disabled={loading}>
            {loading ? 'Loading...' : 'Check'}
          </button>
        </div>

        {error && (
          <div className='p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-sm'>
            {error}
          </div>
        )}

        {stockData && (
          <div className='p-4 rounded-lg bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 shadow-sm'>
            <h3 className='text-lg font-semibold mb-3'>{stockData.ticker}</h3>
            <div className='grid grid-cols-2 gap-3 text-sm'>
              <div>
                <span className='text-slate-600 dark:text-neutral-400'>
                  Current Price:
                </span>
                <div className='font-semibold text-lg'>
                  ${stockData.currentPrice}
                </div>
              </div>
              <div>
                <span className='text-slate-600 dark:text-neutral-400'>
                  Change:
                </span>
                <div
                  className={`font-semibold ${
                    stockData.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                  {stockData.change >= 0 ? '+' : ''}${stockData.change} (
                  {stockData.changePercent}%)
                </div>
              </div>
              <div>
                <span className='text-slate-600 dark:text-neutral-400'>
                  High:
                </span>
                <div className='font-medium'>${stockData.high}</div>
              </div>
              <div>
                <span className='text-slate-600 dark:text-neutral-400'>
                  Low:
                </span>
                <div className='font-medium'>${stockData.low}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

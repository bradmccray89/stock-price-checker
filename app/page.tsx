import { GetStartedButton } from '@/components/ui/button';
import React from 'react';

export default function Home() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-center p-24'>
      <h1 className='text-4xl font-bold'>Welcome to the Stock Price Checker</h1>
      <p className='text-lg'>
        Check the opening stock prices for your favorite companies.
      </p>
      <GetStartedButton />
    </main>
  );
}

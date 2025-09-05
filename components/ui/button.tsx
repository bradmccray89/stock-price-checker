'use client';
import React from 'react';

export function GetStartedButton() {
  return (
    <button
      type='button'
      className='cursor-pointer mt-4 rounded-xl bg-neutral-800 px-6 py-3 text-white transition-colors duration-200 hover:bg-neutral-700'
      onClick={() => {
        window.location.assign('/sign-in');
      }}>
      Get Started
    </button>
  );
}

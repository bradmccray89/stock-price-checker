'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

const SignUpSchema = z
  .object({
    name: z.string().min(2, 'Name is too short'),
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Min 8 characters'),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: 'Passwords must match',
    path: ['confirm'],
  });

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<
    'idle' | 'submitting' | 'success' | 'error'
  >('idle');
  const [info, setInfo] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/stocks');
      } else {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/stocks');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    setErrors({});
    setInfo(null);
    const parsed = SignUpSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((iss) => {
        const key = iss.path[0]?.toString() || 'form';
        if (!fieldErrors[key]) fieldErrors[key] = iss.message;
      });
      setErrors(fieldErrors);
      setStatus('error');
      return;
    }
    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { full_name: form.name },
          emailRedirectTo:
            typeof window !== 'undefined'
              ? `${window.location.origin}/`
              : undefined,
        },
      });
      if (error) throw error;
      setStatus('success');
      if (data.user?.email_confirmed_at) {
        setInfo('Account created. You can now sign in.');
      } else {
        setInfo('Check your email to confirm your account.');
      }
    } catch (err: unknown) {
      console.error('Sign up error:', err);
      let message = 'Failed to sign up. Try again.';
      
      if (err instanceof Error) {
        if (err.message.includes('fetch')) {
          message = 'Network error. Please check your internet connection and try again.';
        } else if (err.message.includes('User already registered')) {
          message = 'This email is already registered. Try signing in instead.';
        } else {
          message = err.message;
        }
      }
      
      setStatus('error');
      setErrors({ form: message });
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex items-center justify-center px-4 py-12'>
      <div className='w-full max-w-md'>
        <div className='rounded-xl border border-slate-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur p-8 shadow-sm'>
          <div className='flex justify-center flex-col text-center'>
            <h1 className='mx-auto text-2xl font-semibold tracking-tight text-slate-900 dark:text-white mb-2'>
              Create account
            </h1>
            <p className='text-sm text-slate-600 dark:text-neutral-400 mb-6'>
              Already have an account?{' '}
              <Link
                href='/sign-in'
                className='text-blue-600 hover:underline dark:text-blue-400'>
                Sign in
              </Link>
            </p>
          </div>
          <form onSubmit={onSubmit} className='space-y-5'>
            <div>
              <label htmlFor='name' className='block text-sm font-medium mb-1'>
                Name
              </label>
              <input
                id='name'
                name='name'
                autoComplete='name'
                value={form.name}
                onChange={onChange}
                className='block w-full rounded-lg border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 dark:placeholder:text-neutral-500'
                placeholder='John Smith'
              />
              {errors.name && (
                <p className='mt-1 text-xs text-red-600'>{errors.name}</p>
              )}
            </div>
            <div>
              <label htmlFor='email' className='block text-sm font-medium mb-1'>
                Email
              </label>
              <input
                id='email'
                name='email'
                type='email'
                autoComplete='email'
                value={form.email}
                onChange={onChange}
                className='block w-full rounded-lg border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 dark:placeholder:text-neutral-500'
                placeholder='you@example.com'
              />
              {errors.email && (
                <p className='mt-1 text-xs text-red-600'>{errors.email}</p>
              )}
            </div>
            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium mb-1'>
                Password
              </label>
              <input
                id='password'
                name='password'
                type='password'
                autoComplete='new-password'
                value={form.password}
                onChange={onChange}
                className='block w-full rounded-lg border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 dark:placeholder:text-neutral-500'
              />
              {errors.password && (
                <p className='mt-1 text-xs text-red-600'>{errors.password}</p>
              )}
            </div>
            <div>
              <label
                htmlFor='confirm'
                className='block text-sm font-medium mb-1'>
                Confirm password
              </label>
              <input
                id='confirm'
                name='confirm'
                type='password'
                autoComplete='new-password'
                value={form.confirm}
                onChange={onChange}
                className='block w-full rounded-lg border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 dark:placeholder:text-neutral-500'
              />
              {errors.confirm && (
                <p className='mt-1 text-xs text-red-600'>{errors.confirm}</p>
              )}
            </div>

            {errors.form && (
              <div className='rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-3 py-2 text-xs text-red-700 dark:text-red-300'>
                {errors.form}
              </div>
            )}
            {status === 'success' && info && (
              <div className='rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 px-3 py-2 text-xs text-green-700 dark:text-green-300'>
                {info}
              </div>
            )}

            <button
              type='submit'
              disabled={status === 'submitting'}
              className='cursor-pointer relative inline-flex w-full items-center justify-center rounded-xl bg-blue-600 text-white text-sm font-medium px-4 py-3 shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed hover:bg-blue-500'>
              {status === 'submitting'
                ? 'Creating account...'
                : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

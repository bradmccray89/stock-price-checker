import Link from 'next/link';

export default function NotFound() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-center p-24'>
      <h1 className='text-4xl font-bold'>404 - Page Not Found</h1>
      <p className='text-lg'>The page you are looking for does not exist.</p>
      <Link href='/' className='text-blue-500 hover:underline'>
        Go back to Home
      </Link>
    </main>
  );
}

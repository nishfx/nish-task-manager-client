// src/app/page.tsx

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Welcome to Task Manager</h1>
      <div className="space-x-4">
        <Link href="/login" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
          Login
        </Link>
        <Link href="/register" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
          Register
        </Link>
      </div>
    </div>
  );
}
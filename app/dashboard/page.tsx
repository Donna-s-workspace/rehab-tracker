'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }
      
      setUser(session.user);
      setLoading(false);
    };

    checkUser();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Rehab Tracker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/log" className="text-gray-700 hover:text-gray-900">
                Log Session
              </Link>
              <Link href="/progress" className="text-gray-700 hover:text-gray-900">
                Progress
              </Link>
              <Link href="/coaching" className="text-gray-700 hover:text-gray-900">
                AI Coaching
              </Link>
              <button
                onClick={handleSignOut}
                className="text-gray-700 hover:text-gray-900"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
            <p className="text-gray-600 mb-6">Welcome back, {user?.email}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900">Last Session</h3>
                <p className="text-2xl font-bold text-blue-600">-</p>
                <p className="text-sm text-blue-700">No sessions yet</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900">Pain Trend</h3>
                <p className="text-2xl font-bold text-green-600">-</p>
                <p className="text-sm text-green-700">Track your progress</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-900">Streak</h3>
                <p className="text-2xl font-bold text-purple-600">0 days</p>
                <p className="text-sm text-purple-700">Keep it up!</p>
              </div>
            </div>

            <Link
              href="/log"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Log New Session
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h3 className="text-xl font-semibold mb-4">Recent Sessions</h3>
            <p className="text-gray-500">No sessions logged yet. Start by logging your first session!</p>
          </div>
        </div>
      </main>
    </div>
  );
}

'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface LastSession {
  date: string;
  session_type: string;
  exercise_count: number;
}

interface PainTrend {
  recent_avg: number | null;
  previous_avg: number | null;
  trend: 'improving' | 'worsening' | 'stable' | 'no_data';
}

interface RecentSession {
  id: string;
  date: string;
  session_type: string;
  notes: string | null;
  exercise_count: number;
}

interface DashboardStats {
  lastSession: LastSession | null;
  painTrend: PainTrend;
  streak: number;
  recentSessions: RecentSession[];
  hasData: boolean;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDashboardStats();
    }
  }, [status]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/dashboard/stats');
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Failed to fetch dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const getPainTrendDisplay = (painTrend: PainTrend) => {
    if (painTrend.trend === 'no_data' || painTrend.recent_avg === null) {
      return { text: '-', subtext: 'No pain data yet', color: 'gray' };
    }
    
    const avgPain = painTrend.recent_avg.toFixed(1);
    
    if (painTrend.trend === 'improving') {
      return { 
        text: `${avgPain}/10 ↓`, 
        subtext: 'Improving!', 
        color: 'green' 
      };
    } else if (painTrend.trend === 'worsening') {
      return { 
        text: `${avgPain}/10 ↑`, 
        subtext: 'Watch closely', 
        color: 'red' 
      };
    } else {
      return { 
        text: `${avgPain}/10`, 
        subtext: 'Stable', 
        color: 'blue' 
      };
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold">Rehab Tracker</h1>
              </div>
              <div className="flex items-center">
                <button onClick={handleSignOut} className="text-gray-700 hover:text-gray-900">
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 font-semibold mb-2">Error loading dashboard</p>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchDashboardStats}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  const painTrendDisplay = stats ? getPainTrendDisplay(stats.painTrend) : null;

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
            <p className="text-gray-600 mb-6">Welcome back, {session.user?.name || session.user?.email}</p>
            
            {!stats?.hasData ? (
              // Empty state
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No sessions yet</h3>
                <p className="mt-1 text-sm text-gray-500 mb-6">
                  Get started by logging your first rehab or gym session!
                </p>
                <Link
                  href="/log"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Log Your First Session
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {/* Last Session */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Last Session</h3>
                    {stats?.lastSession ? (
                      <>
                        <p className="text-2xl font-bold text-blue-600 capitalize">
                          {stats.lastSession.session_type}
                        </p>
                        <p className="text-sm text-blue-700">
                          {formatDate(stats.lastSession.date)}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          {stats.lastSession.exercise_count} exercises
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-blue-600">-</p>
                        <p className="text-sm text-blue-700">No sessions yet</p>
                      </>
                    )}
                  </div>
                  
                  {/* Pain Trend */}
                  <div className={`bg-${painTrendDisplay?.color}-50 p-4 rounded-lg`}>
                    <h3 className={`font-semibold text-${painTrendDisplay?.color}-900 mb-2`}>
                      Pain Trend (7d avg)
                    </h3>
                    <p className={`text-2xl font-bold text-${painTrendDisplay?.color}-600`}>
                      {painTrendDisplay?.text}
                    </p>
                    <p className={`text-sm text-${painTrendDisplay?.color}-700`}>
                      {painTrendDisplay?.subtext}
                    </p>
                  </div>
                  
                  {/* Streak */}
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-900 mb-2">Current Streak</h3>
                    <p className="text-2xl font-bold text-purple-600">
                      {stats?.streak || 0} {stats?.streak === 1 ? 'day' : 'days'}
                    </p>
                    <p className="text-sm text-purple-700">
                      {stats?.streak ? 'Keep it up!' : 'Start your streak!'}
                    </p>
                  </div>
                </div>

                <Link
                  href="/log"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Log New Session
                </Link>
              </>
            )}
          </div>

          {/* Recent Sessions */}
          {stats?.hasData && (
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h3 className="text-xl font-semibold mb-4">Recent Sessions</h3>
              {stats.recentSessions.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentSessions.map((session) => (
                    <div
                      key={session.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold capitalize text-gray-900">
                            {session.session_type}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDate(session.date)} • {session.exercise_count} exercises
                          </p>
                          {session.notes && (
                            <p className="text-sm text-gray-500 mt-1 italic">
                              "{session.notes}"
                            </p>
                          )}
                        </div>
                        <Link
                          href={`/sessions/${session.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No sessions logged yet.</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

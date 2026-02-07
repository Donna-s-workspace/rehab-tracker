'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card, Button, Badge, Spinner, Alert } from 'flowbite-react';
import { 
  HiChartPie, 
  HiTrendingUp, 
  HiTrendingDown, 
  HiFire, 
  HiCalendar,
  HiChartBar,
  HiLightBulb,
  HiLogout,
  HiPlus,
  HiArrowRight
} from 'react-icons/hi';

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
      return { 
        text: '-', 
        subtext: 'No pain data yet', 
        color: 'gray',
        bgColor: 'bg-gray-50',
        textColor: 'text-gray-900',
        icon: HiChartPie
      };
    }
    
    const avgPain = painTrend.recent_avg.toFixed(1);
    
    if (painTrend.trend === 'improving') {
      return { 
        text: `${avgPain}/10`, 
        subtext: 'Improving!', 
        color: 'success',
        bgColor: 'bg-gradient-to-br from-green-50 to-teal-50',
        textColor: 'text-green-900',
        icon: HiTrendingDown
      };
    } else if (painTrend.trend === 'worsening') {
      return { 
        text: `${avgPain}/10`, 
        subtext: 'Watch closely', 
        color: 'failure',
        bgColor: 'bg-gradient-to-br from-red-50 to-pink-50',
        textColor: 'text-red-900',
        icon: HiTrendingUp
      };
    } else {
      return { 
        text: `${avgPain}/10`, 
        subtext: 'Stable', 
        color: 'info',
        bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
        textColor: 'text-blue-900',
        icon: HiChartBar
      };
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spinner size="xl" className="mb-4" />
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
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
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Rehab Tracker
                </h1>
              </div>
              <div className="flex items-center">
                <Button color="gray" size="sm" onClick={handleSignOut}>
                  <HiLogout className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Alert color="failure" className="mb-4">
            <div className="flex flex-col items-center text-center">
              <p className="font-semibold mb-2">Error loading dashboard</p>
              <p className="mb-4">{error}</p>
              <Button color="failure" onClick={fetchDashboardStats} size="sm">
                Retry
              </Button>
            </div>
          </Alert>
        </main>
      </div>
    );
  }

  const painTrendDisplay = stats ? getPainTrendDisplay(stats.painTrend) : null;
  const TrendIcon = painTrendDisplay?.icon || HiChartPie;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                💪 Rehab Tracker
              </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/log">
                <Button color="gray" size="sm" className="hidden sm:flex">
                  Log Session
                </Button>
              </Link>
              <Link href="/progress">
                <Button color="light" size="sm">
                  <HiChartBar className="mr-2 h-4 w-4" />
                  Progress
                </Button>
              </Link>
              <Link href="/coaching">
                <Button color="light" size="sm">
                  <HiLightBulb className="mr-2 h-4 w-4" />
                  AI Coach
                </Button>
              </Link>
              <Button color="gray" size="sm" onClick={handleSignOut}>
                <HiLogout className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back! 👋
          </h2>
          <p className="text-gray-600 text-lg">
            {session.user?.name || session.user?.email}
          </p>
        </div>
        
        {!stats?.hasData ? (
          // Empty state
          <Card className="text-center">
            <div className="py-12">
              <div className="text-6xl mb-6">🏋️</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No sessions yet</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Get started by logging your first rehab or gym session and start tracking your recovery journey!
              </p>
              <Link href="/log">
                <Button size="xl" color="purple">
                  <HiPlus className="mr-2 h-5 w-5" />
                  Log Your First Session
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Last Session */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <HiCalendar className="h-5 w-5 text-blue-600 mr-2" />
                      <h3 className="font-semibold text-blue-900">Last Session</h3>
                    </div>
                    {stats?.lastSession ? (
                      <>
                        <p className="text-3xl font-bold text-blue-700 capitalize mb-1">
                          {stats.lastSession.session_type}
                        </p>
                        <p className="text-sm text-blue-600 mb-1">
                          {formatDate(stats.lastSession.date)}
                        </p>
                        <Badge color="info" size="sm">
                          {stats.lastSession.exercise_count} exercises
                        </Badge>
                      </>
                    ) : (
                      <>
                        <p className="text-3xl font-bold text-blue-700">-</p>
                        <p className="text-sm text-blue-600">No sessions yet</p>
                      </>
                    )}
                  </div>
                </div>
              </Card>
              
              {/* Pain Trend */}
              <Card className={`${painTrendDisplay?.bgColor} border-0 shadow-lg`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <TrendIcon className={`h-5 w-5 ${painTrendDisplay?.textColor} mr-2`} />
                      <h3 className={`font-semibold ${painTrendDisplay?.textColor}`}>
                        Pain Trend (7d)
                      </h3>
                    </div>
                    <p className={`text-3xl font-bold ${painTrendDisplay?.textColor} mb-1`}>
                      {painTrendDisplay?.text}
                    </p>
                    <p className={`text-sm ${painTrendDisplay?.textColor} opacity-80`}>
                      {painTrendDisplay?.subtext}
                    </p>
                  </div>
                </div>
              </Card>
              
              {/* Streak */}
              <Card className="bg-gradient-to-br from-orange-50 to-red-100 border-0 shadow-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <HiFire className="h-5 w-5 text-orange-600 mr-2" />
                      <h3 className="font-semibold text-orange-900">Current Streak</h3>
                    </div>
                    <p className="text-3xl font-bold text-orange-700 mb-1">
                      {stats?.streak || 0} {stats?.streak === 1 ? 'day' : 'days'}
                    </p>
                    <p className="text-sm text-orange-600">
                      {stats?.streak ? 'Keep it up! 🔥' : 'Start your streak!'}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* CTA Button */}
            <div className="mb-8">
              <Link href="/log">
                <Button size="lg" color="purple" className="w-full sm:w-auto">
                  <HiPlus className="mr-2 h-5 w-5" />
                  Log New Session
                </Button>
              </Link>
            </div>

            {/* Recent Sessions */}
            <Card>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <HiChartBar className="mr-2 h-6 w-6 text-blue-600" />
                Recent Sessions
              </h3>
              {stats.recentSessions.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentSessions.map((session) => (
                    <div
                      key={session.id}
                      className="p-5 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all bg-gradient-to-r from-white to-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <Badge color="purple" className="capitalize mr-2">
                              {session.session_type}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {formatDate(session.date)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>{session.exercise_count}</strong> exercises completed
                          </p>
                          {session.notes && (
                            <p className="text-sm text-gray-500 italic bg-gray-50 p-2 rounded">
                              "{session.notes}"
                            </p>
                          )}
                        </div>
                        <Link
                          href={`/sessions/${session.id}`}
                          className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium ml-4"
                        >
                          View
                          <HiArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No sessions logged yet.</p>
                </div>
              )}
            </Card>
          </>
        )}
      </main>
    </div>
  );
}

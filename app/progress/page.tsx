'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, Button, Badge, Spinner, Alert } from 'flowbite-react';
import {
  HiHome,
  HiPlus,
  HiLightBulb,
  HiLogout,
  HiTrendingUp,
  HiFire,
  HiChartBar,
  HiHeart,
  HiLightningBolt,
  HiScale
} from 'react-icons/hi';
import { signOut } from 'next-auth/react';

interface ProgressData {
  painOverTime: Array<{ date: string; avgPain: number }>;
  sessionFrequency: Array<{ date: string; count: number }>;
  volumeTrends: Array<{ date: string; totalReps: number; totalWeight: number }>;
  streak: number;
  totalSessions: number;
}

export default function ProgressPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProgressData();
    }
  }, [status]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/progress');
      
      if (!response.ok) {
        throw new Error('Failed to fetch progress data');
      }
      
      const data = await response.json();
      setProgressData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spinner size="xl" className="mb-4" />
          <p className="text-gray-600 text-lg">Loading progress data...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Alert color="failure">
          <p className="font-semibold">Error: {error}</p>
          <Button onClick={fetchProgressData} color="failure" size="sm" className="mt-4">
            Retry
          </Button>
        </Alert>
      </div>
    );
  }

  // Empty state
  if (progressData && progressData.totalSessions === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <nav className="bg-white shadow-lg border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  💪 Rehab Tracker
                </Link>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Link href="/dashboard">
                  <Button color="light" size="sm">
                    <HiHome className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/log">
                  <Button color="light" size="sm">
                    <HiPlus className="mr-2 h-4 w-4" />
                    Log Session
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
          <Card className="text-center">
            <div className="py-12">
              <div className="text-6xl mb-6">📊</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">No Progress Data Yet</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Start logging your rehab sessions to see your progress over time!
              </p>
              <Link href="/log">
                <Button size="xl" color="purple">
                  <HiPlus className="mr-2 h-5 w-5" />
                  Log Your First Session
                </Button>
              </Link>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const painChartData = progressData?.painOverTime.map(d => ({
    date: formatDate(d.date),
    pain: d.avgPain
  })) || [];

  const sessionFreqData = progressData?.sessionFrequency.map(d => ({
    date: formatDate(d.date),
    sessions: d.count
  })) || [];

  const volumeChartData = progressData?.volumeTrends.map(d => ({
    date: formatDate(d.date),
    reps: d.totalReps,
    weight: d.totalWeight
  })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                💪 Rehab Tracker
              </Link>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/dashboard">
                <Button color="light" size="sm">
                  <HiHome className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/log">
                <Button color="light" size="sm">
                  <HiPlus className="mr-2 h-4 w-4" />
                  Log Session
                </Button>
              </Link>
              <Link href="/coaching">
                <Button color="light" size="sm" className="hidden sm:flex">
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
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <HiTrendingUp className="mr-3 h-8 w-8 text-blue-600" />
            Your Progress
          </h2>
          <p className="text-gray-600 text-lg">Track your recovery journey with visual insights</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <HiChartBar className="h-6 w-6 text-blue-600 mr-2" />
                  <h3 className="text-sm font-semibold text-blue-900">Total Sessions</h3>
                </div>
                <p className="text-4xl font-bold text-blue-700">{progressData?.totalSessions || 0}</p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-50 to-red-100 border-0 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <HiFire className="h-6 w-6 text-orange-600 mr-2" />
                  <h3 className="text-sm font-semibold text-orange-900">Current Streak</h3>
                </div>
                <p className="text-4xl font-bold text-orange-700">{progressData?.streak || 0}</p>
                <p className="text-sm text-orange-600 mt-1">consecutive days</p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-pink-100 border-0 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <HiHeart className="h-6 w-6 text-purple-600 mr-2" />
                  <h3 className="text-sm font-semibold text-purple-900">Latest Pain Level</h3>
                </div>
                <p className="text-4xl font-bold text-purple-700">
                  {painChartData.length > 0 ? painChartData[painChartData.length - 1].pain.toFixed(1) : '-'}
                </p>
                <p className="text-sm text-purple-600 mt-1">out of 10</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Pain Level Over Time */}
        <Card className="mb-8 shadow-lg">
          <div className="flex items-center mb-6">
            <HiHeart className="h-6 w-6 text-red-500 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Pain Level Over Time</h2>
          </div>
          {painChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={painChartData}>
                <defs>
                  <linearGradient id="colorPain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  domain={[0, 10]} 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="pain" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  fill="url(#colorPain)"
                  name="Average Pain Level"
                  dot={{ fill: '#8b5cf6', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No pain data recorded yet</p>
            </div>
          )}
        </Card>

        {/* Session Frequency */}
        <Card className="mb-8 shadow-lg">
          <div className="flex items-center mb-6">
            <HiChartBar className="h-6 w-6 text-blue-500 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Session Frequency</h2>
          </div>
          {sessionFreqData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={sessionFreqData}>
                <defs>
                  <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.5}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="sessions" 
                  fill="url(#colorSessions)" 
                  name="Sessions per Day"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No session data available</p>
            </div>
          )}
        </Card>

        {/* Exercise Volume Trends */}
        <Card className="mb-8 shadow-lg">
          <div className="flex items-center mb-6">
            <HiLightningBolt className="h-6 w-6 text-yellow-500 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Exercise Volume Trends</h2>
          </div>
          {volumeChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={volumeChartData}>
                <defs>
                  <linearGradient id="colorReps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right"
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="reps" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fill="url(#colorReps)"
                  name="Total Reps"
                  dot={{ fill: '#10b981', r: 5 }}
                  activeDot={{ r: 7 }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#f59e0b" 
                  strokeWidth={3}
                  fill="url(#colorWeight)"
                  name="Total Weight (kg)"
                  dot={{ fill: '#f59e0b', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No exercise volume data available</p>
            </div>
          )}
        </Card>

        {/* Tips Section */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-100 border-0 shadow-lg">
          <div className="flex items-start">
            <HiLightBulb className="h-8 w-8 text-blue-600 mr-4 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-blue-900 text-xl mb-3">💡 Tips for Progress</h3>
              <ul className="text-blue-800 space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Log your sessions consistently to track trends accurately</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Record pain levels after each exercise for better insights</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Aim to maintain your streak for consistent recovery</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Gradually increase volume as pain levels decrease</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}

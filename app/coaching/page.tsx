'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card, Button, Badge, Spinner, Alert } from 'flowbite-react';
import {
  HiHome,
  HiPlus,
  HiChartBar,
  HiLogout,
  HiLightBulb,
  HiSparkles,
  HiClock,
  HiCheckCircle,
  HiExclamation,
  HiInformationCircle
} from 'react-icons/hi';

interface CoachingLog {
  id: string;
  recommendation: string;
  created_at: string;
  context: {
    sessions_analyzed: number;
    model: string;
  };
}

export default function CoachingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentRecommendation, setCurrentRecommendation] = useState<string | null>(null);
  const [history, setHistory] = useState<CoachingLog[]>([]);
  const [sessionsAnalyzed, setSessionsAnalyzed] = useState<number>(0);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      loadHistory();
    }
  }, [session]);

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/coaching/history');
      if (response.ok) {
        const data = await response.json();
        setHistory(data.logs || []);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  const analyzeProgress = async () => {
    setLoading(true);
    setError(null);
    setCurrentRecommendation(null);

    try {
      const response = await fetch('/api/coaching/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze progress');
      }

      setCurrentRecommendation(data.recommendation);
      setSessionsAnalyzed(data.sessionsAnalyzed);
      
      await loadHistory();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatRecommendation = (text: string) => {
    const lines = text.split('\n');
    const formatted: React.ReactElement[] = [];
    let currentSection: { type: string; items: string[] } | null = null;

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('## ')) {
        if (currentSection) {
          const section = renderSection(currentSection, formatted.length);
          if (section) formatted.push(section);
          currentSection = null;
        }
        formatted.push(
          <h3 key={idx} className="text-xl font-bold mt-6 mb-3 text-blue-900 flex items-center">
            <HiCheckCircle className="mr-2 h-5 w-5 text-green-600" />
            {trimmed.slice(3)}
          </h3>
        );
      } else if (trimmed.startsWith('# ')) {
        if (currentSection) {
          const section = renderSection(currentSection, formatted.length);
          if (section) formatted.push(section);
          currentSection = null;
        }
        formatted.push(
          <h2 key={idx} className="text-2xl font-bold mt-8 mb-4 text-blue-900">
            {trimmed.slice(2)}
          </h2>
        );
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const item = trimmed.slice(2);
        if (!currentSection) {
          currentSection = { type: 'list', items: [item] };
        } else {
          currentSection.items.push(item);
        }
      } else if (trimmed === '') {
        if (currentSection) {
          const section = renderSection(currentSection, formatted.length);
          if (section) formatted.push(section);
          currentSection = null;
        }
        formatted.push(<div key={idx} className="h-2" />);
      } else if (trimmed) {
        if (currentSection) {
          const section = renderSection(currentSection, formatted.length);
          if (section) formatted.push(section);
          currentSection = null;
        }
        formatted.push(
          <p key={idx} className="mb-3 text-gray-700 leading-relaxed">
            {trimmed}
          </p>
        );
      }
    });

    if (currentSection) {
      const section = renderSection(currentSection, formatted.length);
      if (section) formatted.push(section);
    }

    return formatted;
  };

  const renderSection = (section: { type: string; items: string[] }, key: number) => {
    if (section.type === 'list') {
      return (
        <ul key={key} className="mb-4 space-y-2">
          {section.items.map((item, i) => {
            const icon = getRecommendationIcon(item);
            return (
              <li key={i} className="flex items-start">
                <span className="mr-3 mt-1 flex-shrink-0">{icon}</span>
                <span className="text-gray-700">{item}</span>
              </li>
            );
          })}
        </ul>
      );
    }
    return null;
  };

  const getRecommendationIcon = (text: string) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('reduce') || lowerText.includes('decrease') || lowerText.includes('lower')) {
      return <HiExclamation className="h-5 w-5 text-yellow-500" />;
    } else if (lowerText.includes('increase') || lowerText.includes('more') || lowerText.includes('progress')) {
      return <HiCheckCircle className="h-5 w-5 text-green-500" />;
    } else {
      return <HiInformationCircle className="h-5 w-5 text-blue-500" />;
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
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
              <Link href="/progress">
                <Button color="light" size="sm" className="hidden sm:flex">
                  <HiChartBar className="mr-2 h-4 w-4" />
                  Progress
                </Button>
              </Link>
              <Button color="gray" size="sm" onClick={handleSignOut}>
                <HiLogout className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header Card */}
        <Card className="mb-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 shadow-xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <HiSparkles className="h-10 w-10 mr-3" />
                <div>
                  <h2 className="text-3xl font-bold">AI Coaching</h2>
                  <p className="text-purple-100 mt-1">Get personalized recommendations powered by AI</p>
                </div>
              </div>
            </div>
            <Button
              onClick={analyzeProgress}
              disabled={loading}
              color="light"
              size="lg"
              className="flex-shrink-0"
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <HiLightBulb className="mr-2 h-5 w-5" />
                  Analyze Progress
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert color="failure" icon={HiExclamation} className="mb-8" onDismiss={() => setError(null)}>
            <span className="font-semibold">Error:</span> {error}
          </Alert>
        )}

        {/* Current Recommendation */}
        {currentRecommendation && (
          <Card className="mb-8 border-2 border-blue-200 shadow-xl">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 -m-6 mb-6 p-6 rounded-t-lg border-b-2 border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-blue-600 p-3 rounded-full mr-4">
                    <HiSparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Your Latest Coaching Report</h3>
                    <div className="flex items-center mt-1 text-sm text-gray-600">
                      <HiClock className="mr-1 h-4 w-4" />
                      <span>Based on {sessionsAnalyzed} recent data points</span>
                    </div>
                  </div>
                </div>
                <Badge color="success" size="lg">
                  New
                </Badge>
              </div>
            </div>
            <div className="prose prose-lg max-w-none">
              {formatRecommendation(currentRecommendation)}
            </div>
          </Card>
        )}

        {/* Loading State */}
        {loading && !currentRecommendation && (
          <Card className="mb-8">
            <div className="text-center py-12">
              <Spinner size="xl" className="mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Analyzing Your Progress</h3>
              <p className="text-gray-600">Our AI is reviewing your session history...</p>
            </div>
          </Card>
        )}

        {/* Coaching History */}
        {history.length > 0 && (
          <Card className="shadow-lg">
            <div className="flex items-center mb-6">
              <HiClock className="h-6 w-6 text-purple-600 mr-3" />
              <h3 className="text-2xl font-bold text-gray-900">Coaching History</h3>
            </div>
            <div className="space-y-4">
              {history.map((log, index) => (
                <details 
                  key={log.id} 
                  className="group border-2 border-gray-200 rounded-lg p-5 hover:border-blue-300 transition-all cursor-pointer bg-gradient-to-r from-white to-gray-50"
                >
                  <summary className="font-semibold text-gray-900 flex items-center justify-between">
                    <div className="flex items-center">
                      <Badge color="purple" className="mr-3">
                        Report {history.length - index}
                      </Badge>
                      <span className="text-gray-700">
                        {new Date(log.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <HiInformationCircle className="mr-1 h-4 w-4" />
                      {log.context?.sessions_analyzed || 0} sessions analyzed
                    </div>
                  </summary>
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="prose prose-sm max-w-none">
                      {formatRecommendation(log.recommendation)}
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </Card>
        )}

        {/* Empty State */}
        {history.length === 0 && !currentRecommendation && !loading && (
          <Card className="shadow-lg">
            <div className="text-center py-16">
              <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <HiLightBulb className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Coaching History Yet</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Click "Analyze Progress" to get your first personalized coaching recommendations based on your session data!
              </p>
              <Button
                onClick={analyzeProgress}
                disabled={loading}
                color="purple"
                size="lg"
              >
                <HiSparkles className="mr-2 h-5 w-5" />
                Get Your First Report
              </Button>
            </div>
          </Card>
        )}

        {/* Info Section */}
        <Alert color="info" icon={HiInformationCircle} className="mt-8">
          <div>
            <span className="font-semibold">How AI Coaching Works:</span>
            <p className="mt-2">
              Our AI analyzes your rehab sessions, pain levels, and exercise patterns to provide personalized 
              recommendations. The more data you log, the better insights you'll receive!
            </p>
          </div>
        </Alert>
      </main>
    </div>
  );
}

'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { 
  Card, 
  Button, 
  Label, 
  TextInput, 
  Textarea, 
  Select,
  Alert,
  Badge,
  Spinner
} from 'flowbite-react';
import { 
  HiHome,
  HiChartBar,
  HiLightBulb,
  HiLogout,
  HiPlus,
  HiTrash,
  HiCheckCircle,
  HiX,
  HiClipboardList,
  HiScale,
  HiHeart,
  HiPencil
} from 'react-icons/hi';

interface Exercise {
  id: string;
  name: string;
  category: string;
  is_rehab: boolean;
}

interface SessionSet {
  exercise_id: string;
  set_number: number;
  reps: number;
  weight: number | null;
  pain_level: number | null;
  notes: string;
}

export default function LogSessionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [sessionType, setSessionType] = useState<'rehab' | 'gym'>('rehab');
  const [sessionNotes, setSessionNotes] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [sets, setSets] = useState<SessionSet[]>([
    { exercise_id: '', set_number: 1, reps: 0, weight: null, pain_level: null, notes: '' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchExercises();
    }
  }, [session]);

  const fetchExercises = async () => {
    try {
      const response = await fetch('/api/exercises');
      if (response.ok) {
        const data = await response.json();
        setExercises(data.exercises);
      }
    } catch (error) {
      console.error('Failed to fetch exercises:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  const addSet = () => {
    const newSetNumber = sets.length + 1;
    const lastSet = sets[sets.length - 1];
    setSets([
      ...sets,
      {
        exercise_id: lastSet.exercise_id,
        set_number: newSetNumber,
        reps: 0,
        weight: null,
        pain_level: null,
        notes: ''
      }
    ]);
  };

  const removeSet = (index: number) => {
    if (sets.length > 1) {
      const updatedSets = sets.filter((_, i) => i !== index);
      // Re-number sets
      const reNumbered = updatedSets.map((set, i) => ({
        ...set,
        set_number: i + 1
      }));
      setSets(reNumbered);
    }
  };

  const updateSet = (index: number, field: keyof SessionSet, value: any) => {
    const updatedSets = [...sets];
    updatedSets[index] = { ...updatedSets[index], [field]: value };
    setSets(updatedSets);
  };

  const validateForm = (): boolean => {
    for (let i = 0; i < sets.length; i++) {
      const set = sets[i];
      if (!set.exercise_id) {
        setError(`Set ${i + 1}: Please select an exercise`);
        return false;
      }
      if (!set.reps || set.reps <= 0) {
        setError(`Set ${i + 1}: Reps must be greater than 0`);
        return false;
      }
      if (set.pain_level !== null && (set.pain_level < 0 || set.pain_level > 10)) {
        setError(`Set ${i + 1}: Pain level must be between 0 and 10`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const sessionResponse = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_type: sessionType,
          notes: sessionNotes || null,
        }),
      });

      if (!sessionResponse.ok) {
        const errorData = await sessionResponse.json();
        throw new Error(errorData.error || 'Failed to create session');
      }

      const sessionData = await sessionResponse.json();
      const sessionId = sessionData.session.id;

      for (const set of sets) {
        const setResponse = await fetch(`/api/sessions/${sessionId}/sets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            exercise_id: set.exercise_id,
            set_number: set.set_number,
            reps: set.reps,
            weight: set.weight,
            pain_level: set.pain_level,
            notes: set.notes || null,
          }),
        });

        if (!setResponse.ok) {
          const errorData = await setResponse.json();
          throw new Error(errorData.error || 'Failed to create set');
        }
      }

      setSuccess(true);
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);

    } catch (error) {
      console.error('Submission error:', error);
      setError(error instanceof Error ? error.message : 'Failed to log session');
    } finally {
      setIsSubmitting(false);
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
              <Link href="/progress">
                <Button color="light" size="sm" className="hidden sm:flex">
                  <HiChartBar className="mr-2 h-4 w-4" />
                  Progress
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

      <main className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Card>
          <div className="flex items-center mb-6">
            <HiClipboardList className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">Log Session</h2>
          </div>

          {error && (
            <Alert color="failure" icon={HiX} className="mb-6" onDismiss={() => setError(null)}>
              <span className="font-medium">Error!</span> {error}
            </Alert>
          )}

          {success && (
            <Alert color="success" icon={HiCheckCircle} className="mb-6">
              <span className="font-medium">Success!</span> Session logged successfully! Redirecting...
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            {/* Session Type */}
            <div className="mb-8">
              <Label htmlFor="sessionType" className="text-base font-semibold mb-3 block">
                Session Type <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  onClick={() => setSessionType('rehab')}
                  color={sessionType === 'rehab' ? 'blue' : 'light'}
                  size="lg"
                  className="h-16"
                >
                  <div className="flex flex-col items-center">
                    <HiHeart className="h-6 w-6 mb-1" />
                    <span className="font-semibold">Rehab</span>
                  </div>
                </Button>
                <Button
                  type="button"
                  onClick={() => setSessionType('gym')}
                  color={sessionType === 'gym' ? 'blue' : 'light'}
                  size="lg"
                  className="h-16"
                >
                  <div className="flex flex-col items-center">
                    <HiChartBar className="h-6 w-6 mb-1" />
                    <span className="font-semibold">Gym</span>
                  </div>
                </Button>
              </div>
            </div>

            {/* Session Notes */}
            <div className="mb-8">
              <div className="flex items-center mb-2">
                <HiPencil className="h-5 w-5 text-gray-600 mr-2" />
                <Label htmlFor="sessionNotes" className="text-base font-semibold">
                  Session Notes
                </Label>
              </div>
              <Textarea
                id="sessionNotes"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                rows={3}
                placeholder="How did the session go? Any observations?"
                className="resize-none"
              />
            </div>

            {/* Sets */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Exercises & Sets</h3>
                <Button
                  type="button"
                  onClick={addSet}
                  color="purple"
                  size="sm"
                >
                  <HiPlus className="mr-2 h-4 w-4" />
                  Add Set
                </Button>
              </div>

              <div className="space-y-4">
                {sets.map((set, index) => (
                  <Card key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
                    <div className="flex justify-between items-center mb-4">
                      <Badge color="purple" size="lg">
                        Set {set.set_number}
                      </Badge>
                      {sets.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeSet(index)}
                          color="failure"
                          size="xs"
                        >
                          <HiTrash className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Exercise */}
                      <div className="md:col-span-2">
                        <Label htmlFor={`exercise-${index}`}>
                          Exercise <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          id={`exercise-${index}`}
                          value={set.exercise_id}
                          onChange={(e) => updateSet(index, 'exercise_id', e.target.value)}
                          required
                          icon={HiClipboardList}
                        >
                          <option value="">Select an exercise</option>
                          {exercises.map((exercise) => (
                            <option key={exercise.id} value={exercise.id}>
                              {exercise.name} {exercise.is_rehab ? '(Rehab)' : ''}
                            </option>
                          ))}
                        </Select>
                      </div>

                      {/* Reps */}
                      <div>
                        <Label htmlFor={`reps-${index}`}>
                          Reps <span className="text-red-500">*</span>
                        </Label>
                        <TextInput
                          id={`reps-${index}`}
                          type="number"
                          value={set.reps || ''}
                          onChange={(e) => updateSet(index, 'reps', parseInt(e.target.value) || 0)}
                          min="1"
                          required
                          placeholder="e.g., 10"
                        />
                      </div>

                      {/* Weight */}
                      <div>
                        <Label htmlFor={`weight-${index}`}>
                          Weight (kg)
                        </Label>
                        <TextInput
                          id={`weight-${index}`}
                          type="number"
                          value={set.weight || ''}
                          onChange={(e) => updateSet(index, 'weight', e.target.value ? parseFloat(e.target.value) : null)}
                          step="0.5"
                          min="0"
                          placeholder="Optional"
                          icon={HiScale}
                        />
                      </div>

                      {/* Pain Level */}
                      <div>
                        <Label htmlFor={`pain-${index}`}>
                          Pain Level (0-10)
                        </Label>
                        <TextInput
                          id={`pain-${index}`}
                          type="number"
                          value={set.pain_level ?? ''}
                          onChange={(e) => updateSet(index, 'pain_level', e.target.value ? parseInt(e.target.value) : null)}
                          min="0"
                          max="10"
                          placeholder="Optional"
                          icon={HiHeart}
                        />
                      </div>

                      {/* Notes */}
                      <div>
                        <Label htmlFor={`notes-${index}`}>
                          Notes
                        </Label>
                        <TextInput
                          id={`notes-${index}`}
                          type="text"
                          value={set.notes}
                          onChange={(e) => updateSet(index, 'notes', e.target.value)}
                          placeholder="Optional"
                          icon={HiPencil}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                type="submit"
                disabled={isSubmitting || success}
                color="purple"
                size="lg"
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Logging Session...
                  </>
                ) : (
                  <>
                    <HiCheckCircle className="mr-2 h-5 w-5" />
                    Log Session
                  </>
                )}
              </Button>
              <Link href="/dashboard" className="flex-1">
                <Button
                  type="button"
                  color="gray"
                  size="lg"
                  className="w-full"
                >
                  <HiX className="mr-2 h-5 w-5" />
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}

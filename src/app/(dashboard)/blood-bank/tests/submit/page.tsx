'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const TEST_TYPES = [
  { id: 'HIV', name: 'HIV Screening' },
  { id: 'HEPATITIS_B', name: 'Hepatitis B' },
  { id: 'HEPATITIS_C', name: 'Hepatitis C' },
  { id: 'SYPHILIS', name: 'Syphilis' },
  { id: 'BLOOD_GROUP', name: 'Blood Group Verification' },
  { id: 'HEMOGLOBIN', name: 'Hemoglobin Level' },
];

const TEST_RESULTS = [
  { value: 'NEGATIVE', label: 'Negative', color: 'green' },
  { value: 'POSITIVE', label: 'Positive', color: 'red' },
  { value: 'INCONCLUSIVE', label: 'Inconclusive', color: 'yellow' },
];

interface BloodUnit {
  id: string;
  unitCode: string;
  bloodGroup: string;
}

export default function SubmitTestPage() {
  const [units, setUnits] = useState<BloodUnit[]>([]);
  const [formData, setFormData] = useState({
    bloodUnitId: '',
    testType: '',
    result: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetchingUnits, setFetchingUnits] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function fetchPendingUnits() {
      try {
        const response = await fetch('/api/donations?status=TESTING');
        if (response.ok) {
          const data = await response.json();
          setUnits(data.donations || []);
        }
      } catch (err) {
        console.error('Failed to fetch units:', err);
      } finally {
        setFetchingUnits(false);
      }
    }

    fetchPendingUnits();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/tests/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess('Test result submitted successfully!');
        setFormData({ bloodUnitId: '', testType: '', result: '', notes: '' });
        // Refresh units list
        const unitsRes = await fetch('/api/donations?status=TESTING');
        if (unitsRes.ok) {
          const data = await unitsRes.json();
          setUnits(data.donations || []);
        }
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to submit test result');
      }
    } catch {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Submit Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Blood Unit
              </label>
              {fetchingUnits ? (
                <div className="text-gray-500">Loading units...</div>
              ) : units.length === 0 ? (
                <div className="text-gray-500">No units pending testing</div>
              ) : (
                <select
                  value={formData.bloodUnitId}
                  onChange={(e) => setFormData({ ...formData, bloodUnitId: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="">Select a blood unit</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.unitCode} - {unit.bloodGroup}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Test Type
              </label>
              <select
                value={formData.testType}
                onChange={(e) => setFormData({ ...formData, testType: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              >
                <option value="">Select test type</option>
                {TEST_TYPES.map((test) => (
                  <option key={test.id} value={test.id}>
                    {test.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Result
              </label>
              <div className="grid grid-cols-3 gap-2">
                {TEST_RESULTS.map((result) => (
                  <button
                    key={result.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, result: result.value })}
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                      formData.result === result.value
                        ? result.color === 'green'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : result.color === 'red'
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-yellow-500 bg-yellow-50 text-yellow-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {result.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={3}
                placeholder="Any additional notes..."
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                className="flex-1"
                loading={loading}
                disabled={units.length === 0}
              >
                Submit Test Result
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/blood-bank/tests')}
              >
                Back to Tests
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

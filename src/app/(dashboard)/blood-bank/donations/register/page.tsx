'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { getBloodGroupDisplay } from '@/lib/utils';

const BLOOD_GROUPS = [
  { value: 'A_POSITIVE', label: 'A+' },
  { value: 'A_NEGATIVE', label: 'A-' },
  { value: 'B_POSITIVE', label: 'B+' },
  { value: 'B_NEGATIVE', label: 'B-' },
  { value: 'AB_POSITIVE', label: 'AB+' },
  { value: 'AB_NEGATIVE', label: 'AB-' },
  { value: 'O_POSITIVE', label: 'O+' },
  { value: 'O_NEGATIVE', label: 'O-' },
];

interface Donor {
  id: string;
  name: string;
  bloodGroup: string;
  isEligible: boolean;
}

export default function RegisterDonationPage() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [formData, setFormData] = useState({
    donorId: '',
    bloodGroup: '',
    volumeMl: 450,
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetchingDonors, setFetchingDonors] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function fetchDonors() {
      try {
        const response = await fetch('/api/donors?eligible=true');
        if (response.ok) {
          const data = await response.json();
          setDonors(data.donors || []);
        }
      } catch (err) {
        console.error('Failed to fetch donors:', err);
      } finally {
        setFetchingDonors(false);
      }
    }

    fetchDonors();
  }, []);

  const handleDonorChange = (donorId: string) => {
    const donor = donors.find((d) => d.id === donorId);
    setFormData({
      ...formData,
      donorId,
      bloodGroup: donor?.bloodGroup || '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/donations/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess('Donation registered successfully!');
        setTimeout(() => router.push('/blood-bank/donations'), 1500);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to register donation');
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
          <CardTitle>Register New Donation</CardTitle>
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
                Select Donor
              </label>
              {fetchingDonors ? (
                <div className="text-gray-500">Loading donors...</div>
              ) : (
                <select
                  value={formData.donorId}
                  onChange={(e) => handleDonorChange(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="">Select a donor</option>
                  {donors.map((donor) => (
                    <option key={donor.id} value={donor.id}>
                      {donor.name} - {getBloodGroupDisplay(donor.bloodGroup)}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Blood Group
              </label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              >
                <option value="">Select Blood Group</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg.value} value={bg.value}>
                    {bg.label}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Volume (ml)"
              type="number"
              min="200"
              max="500"
              value={formData.volumeMl}
              onChange={(e) => setFormData({ ...formData, volumeMl: parseInt(e.target.value) })}
              required
            />

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
              <Button type="submit" className="flex-1" loading={loading}>
                Register Donation
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

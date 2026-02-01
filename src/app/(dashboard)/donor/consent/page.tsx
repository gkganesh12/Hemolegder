'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface Consent {
  id: string;
  consentType: string;
  grantedTo: string;
  status: string;
  grantedAt: string;
}

const CONSENT_TYPES = [
  {
    type: 'DATA_SHARING',
    title: 'Data Sharing',
    description: 'Allow blood banks and hospitals to access your donation data',
  },
  {
    type: 'RESEARCH',
    title: 'Research',
    description: 'Allow use of anonymized data for medical research',
  },
  {
    type: 'MARKETING',
    title: 'Donation Reminders',
    description: 'Receive reminders when you become eligible to donate again',
  },
];

export default function ConsentPage() {
  const [consents, setConsents] = useState<Consent[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchConsents();
  }, []);

  async function fetchConsents() {
    try {
      const response = await fetch('/api/consent');
      if (response.ok) {
        const data = await response.json();
        setConsents(data.consents || []);
      }
    } catch (err) {
      console.error('Failed to fetch consents:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleToggleConsent = async (consentType: string, currentStatus: boolean) => {
    setUpdating(consentType);
    setError('');

    try {
      const endpoint = currentStatus ? '/api/consent/revoke' : '/api/consent/grant';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consentType, grantedTo: 'SYSTEM' }),
      });

      if (response.ok) {
        await fetchConsents();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update consent');
      }
    } catch (err) {
      setError('Failed to update consent');
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  const isGranted = (type: string) => {
    return consents.some((c) => c.consentType === type && c.status === 'GRANTED');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Consent Settings</h1>
        <p className="text-gray-600">Manage how your data is used</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
      )}

      <div className="grid gap-4">
        {CONSENT_TYPES.map((consent) => {
          const granted = isGranted(consent.type);
          const isUpdating = updating === consent.type;
          return (
            <Card key={consent.type}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{consent.title}</h3>
                      <Badge variant={granted ? 'success' : 'default'}>
                        {granted ? 'Granted' : 'Not Granted'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{consent.description}</p>
                  </div>
                  <Button
                    variant={granted ? 'danger' : 'primary'}
                    onClick={() => handleToggleConsent(consent.type, granted)}
                    loading={isUpdating}
                    disabled={isUpdating}
                  >
                    {granted ? 'Revoke' : 'Grant'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Rights</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start gap-2">
              <svg className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              You can revoke consent at any time
            </li>
            <li className="flex items-start gap-2">
              <svg className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              All consent changes are recorded on blockchain
            </li>
            <li className="flex items-start gap-2">
              <svg className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Your personal data is always encrypted
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

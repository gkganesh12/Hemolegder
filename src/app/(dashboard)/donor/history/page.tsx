'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { formatDate, getBloodGroupDisplay, getStatusColor } from '@/lib/utils';

interface Donation {
  id: string;
  unitCode: string;
  bloodGroup: string;
  status: string;
  collectionDate: string;
  expiryDate: string;
  tests: Array<{
    testType: string;
    result: string;
  }>;
}

export default function DonationHistoryPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDonations() {
      try {
        const response = await fetch('/api/donors/me');
        if (response.ok) {
          const data = await response.json();
          setDonations(data.profile?.donations || []);
        } else {
          setError('Failed to load donations');
        }
      } catch (err) {
        setError('Failed to load donations');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchDonations();
  }, []);

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
        <h1 className="text-2xl font-bold text-gray-900">Donation History</h1>
        <p className="text-gray-600">View all your past donations</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Donations ({donations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {donations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit Code</TableHead>
                  <TableHead>Blood Group</TableHead>
                  <TableHead>Collection Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tests</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donations.map((donation) => (
                  <TableRow key={donation.id}>
                    <TableCell className="font-medium">{donation.unitCode}</TableCell>
                    <TableCell>{getBloodGroupDisplay(donation.bloodGroup)}</TableCell>
                    <TableCell>{formatDate(donation.collectionDate)}</TableCell>
                    <TableCell>{formatDate(donation.expiryDate)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(donation.status)}>
                        {donation.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {donation.tests.length > 0 ? (
                          donation.tests.map((test, i) => (
                            <Badge
                              key={i}
                              variant={test.result === 'NEGATIVE' ? 'success' : 'danger'}
                            >
                              {test.testType}: {test.result}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-gray-400 text-sm">Pending</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <svg
                className="h-12 w-12 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <p className="text-gray-600">No donations yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Your donation history will appear here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDateTime, getBloodGroupDisplay, getStatusColor } from '@/lib/utils';

interface Donation {
  id: string;
  unitCode: string;
  donorName: string;
  bloodGroup: string;
  collectedAt: string;
  status: string;
  volume: number;
}

export default function BloodBankDonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const response = await fetch('/api/donations');
      if (response.ok) {
        const data = await response.json();
        setDonations(data.donations || []);
      }
    } catch (error) {
      console.error('Failed to fetch donations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Donation Management</h1>
        <a href="/blood-bank/donations/register">
          <Button>Register New Donation</Button>
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <p className="text-sm text-gray-500">Today&apos;s Collections</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">0</div>
            <p className="text-sm text-gray-500">Tested & Ready</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">0</div>
            <p className="text-sm text-gray-500">Pending Tests</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">0</div>
            <p className="text-sm text-gray-500">Expired This Week</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Donations</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading donations...</div>
          ) : donations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No donations recorded yet</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit Code</TableHead>
                  <TableHead>Donor</TableHead>
                  <TableHead>Blood Group</TableHead>
                  <TableHead>Collected At</TableHead>
                  <TableHead>Volume (ml)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donations.map((donation) => (
                  <TableRow key={donation.id}>
                    <TableCell className="font-mono">{donation.unitCode}</TableCell>
                    <TableCell>{donation.donorName}</TableCell>
                    <TableCell>
                      <Badge variant="default">
                        {getBloodGroupDisplay(donation.bloodGroup)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDateTime(donation.collectedAt)}</TableCell>
                    <TableCell>{donation.volume}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(donation.status) as 'default' | 'success' | 'warning' | 'destructive'}>
                        {donation.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">View</Button>
                        <Button variant="outline" size="sm">Test</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

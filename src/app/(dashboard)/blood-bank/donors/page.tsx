'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatDate, getBloodGroupDisplay } from '@/lib/utils';

interface Donor {
  id: string;
  name: string;
  contact?: string;
  bloodGroup: string;
  lastDonationDate: string | null;
  donationCount: number;
  isEligible: boolean;
}

export default function BloodBankDonorsPage() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDonors();
  }, []);

  const fetchDonors = async () => {
    try {
      const response = await fetch('/api/donors');
      if (response.ok) {
        const data = await response.json();
        setDonors(data.donors || []);
      }
    } catch (error) {
      console.error('Failed to fetch donors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDonors = donors.filter(donor =>
    (donor.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    donor.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Donor Management</h1>
        <a href="/blood-bank/donors/register">
          <Button>Add New Donor</Button>
        </a>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Registered Donors</CardTitle>
            <Input
              placeholder="Search donors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading donors...</div>
          ) : filteredDonors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No donors match your search' : 'No donors registered yet'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Blood Group</TableHead>
                  <TableHead>Last Donation</TableHead>
                  <TableHead>Total Donations</TableHead>
                  <TableHead>Eligibility</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDonors.map((donor) => (
                  <TableRow key={donor.id}>
                    <TableCell className="font-medium">
                      {donor.name || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">
                        {getBloodGroupDisplay(donor.bloodGroup)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {donor.lastDonationDate ? formatDate(donor.lastDonationDate) : 'Never'}
                    </TableCell>
                    <TableCell>{donor.donationCount}</TableCell>
                    <TableCell>
                      <Badge variant={donor.isEligible ? 'success' : 'warning'}>
                        {donor.isEligible ? 'Eligible' : 'Not Eligible'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
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

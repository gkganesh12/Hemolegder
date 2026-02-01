'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDateTime, getBloodGroupDisplay, getStatusColor } from '@/lib/utils';

interface BloodRequest {
  id: string;
  requestCode: string;
  hospitalName: string;
  bloodGroup: string;
  quantity: number;
  urgency: string;
  status: string;
  requestedAt: string;
  requiredBy: string;
}

export default function BloodBankRequestsPage() {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/requests');
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });
      if (response.ok) {
        fetchRequests();
      }
    } catch (error) {
      console.error('Failed to approve request:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await fetch(`/api/requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', reason: 'Insufficient inventory' }),
      });
      if (response.ok) {
        fetchRequests();
      }
    } catch (error) {
      console.error('Failed to reject request:', error);
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'CRITICAL':
        return <Badge variant="destructive">Critical</Badge>;
      case 'URGENT':
        return <Badge variant="warning">Urgent</Badge>;
      case 'ROUTINE':
        return <Badge variant="default">Routine</Badge>;
      default:
        return <Badge variant="default">{urgency}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Blood Requests</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">
              {requests.filter(r => r.status === 'PENDING').length}
            </div>
            <p className="text-sm text-gray-500">Pending Requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {requests.filter(r => r.urgency === 'CRITICAL').length}
            </div>
            <p className="text-sm text-gray-500">Critical Requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {requests.filter(r => r.status === 'APPROVED').length}
            </div>
            <p className="text-sm text-gray-500">Approved Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {requests.filter(r => r.status === 'ISSUED').length}
            </div>
            <p className="text-sm text-gray-500">Issued Today</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Incoming Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No blood requests yet</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request Code</TableHead>
                  <TableHead>Hospital</TableHead>
                  <TableHead>Blood Group</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Required By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-mono">{request.requestCode}</TableCell>
                    <TableCell>{request.hospitalName}</TableCell>
                    <TableCell>
                      <Badge variant="default">
                        {getBloodGroupDisplay(request.bloodGroup)}
                      </Badge>
                    </TableCell>
                    <TableCell>{request.quantity} units</TableCell>
                    <TableCell>{getUrgencyBadge(request.urgency)}</TableCell>
                    <TableCell>{formatDateTime(request.requiredBy)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(request.status) as 'default' | 'success' | 'warning' | 'destructive'}>
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {request.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleApprove(request.id)}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(request.id)}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                      {request.status === 'APPROVED' && (
                        <Button variant="default" size="sm">
                          Issue Blood
                        </Button>
                      )}
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

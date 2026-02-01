'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDateTime } from '@/lib/utils';

const TEST_TYPES = [
  { id: 'HIV', name: 'HIV Screening', required: true },
  { id: 'HEPATITIS_B', name: 'Hepatitis B', required: true },
  { id: 'HEPATITIS_C', name: 'Hepatitis C', required: true },
  { id: 'SYPHILIS', name: 'Syphilis', required: true },
  { id: 'BLOOD_GROUP', name: 'Blood Group Verification', required: true },
  { id: 'HEMOGLOBIN', name: 'Hemoglobin Level', required: true },
];

interface TestResult {
  id: string;
  unitCode: string;
  testType: string;
  result: string;
  testedAt: string;
  testedBy: string;
  blockchainTxId: string | null;
}

export default function BloodBankTestsPage() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingUnits, setPendingUnits] = useState<string[]>([]);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await fetch('/api/tests');
      if (response.ok) {
        const data = await response.json();
        setTests(data.tests || []);
        setPendingUnits(data.pendingUnits || []);
      }
    } catch (error) {
      console.error('Failed to fetch tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'NEGATIVE':
        return <Badge variant="success">Negative</Badge>;
      case 'POSITIVE':
        return <Badge variant="destructive">Positive</Badge>;
      case 'INCONCLUSIVE':
        return <Badge variant="warning">Inconclusive</Badge>;
      default:
        return <Badge variant="default">{result}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Blood Testing</h1>
        <a href="/blood-bank/tests/submit">
          <Button>Submit Test Results</Button>
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{pendingUnits.length}</div>
            <p className="text-sm text-gray-500">Units Pending Testing</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">0</div>
            <p className="text-sm text-gray-500">Passed All Tests Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">0</div>
            <p className="text-sm text-gray-500">Failed Tests Today</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Required Test Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {TEST_TYPES.map((test) => (
              <div
                key={test.id}
                className="p-4 border rounded-lg flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">{test.name}</p>
                  <p className="text-sm text-gray-500">{test.id}</p>
                </div>
                {test.required && (
                  <Badge variant="default">Required</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading test results...</div>
          ) : tests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No test results recorded yet</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit Code</TableHead>
                  <TableHead>Test Type</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Tested At</TableHead>
                  <TableHead>Tested By</TableHead>
                  <TableHead>Blockchain</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tests.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell className="font-mono">{test.unitCode}</TableCell>
                    <TableCell>{test.testType}</TableCell>
                    <TableCell>{getResultBadge(test.result)}</TableCell>
                    <TableCell>{formatDateTime(test.testedAt)}</TableCell>
                    <TableCell>{test.testedBy}</TableCell>
                    <TableCell>
                      {test.blockchainTxId ? (
                        <Badge variant="success">Verified</Badge>
                      ) : (
                        <Badge variant="warning">Pending</Badge>
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

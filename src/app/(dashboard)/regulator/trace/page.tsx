'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getBloodGroupDisplay, formatDateTime, getStatusColor } from '@/lib/utils';

interface TraceData {
  bloodUnit: {
    id: string;
    unitCode: string;
    bloodGroup: string;
    status: string;
    collectionDate: string;
    expiryDate: string;
    dataHash: string;
    blockchainTxId: string | null;
  };
  organization: {
    name: string;
    type: string;
  };
  tests: Array<{
    testType: string;
    result: string;
    testDate: string;
    blockchainTxId: string | null;
  }>;
  transfers: Array<{
    fromOrgId: string;
    toOrgId: string;
    transferDate: string;
    blockchainTxId: string | null;
  }>;
  blockchainVerified: boolean;
}

export default function TracePage() {
  const [unitId, setUnitId] = useState('');
  const [trace, setTrace] = useState<TraceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrace = async () => {
    if (!unitId.trim()) return;
    setLoading(true);
    setError('');
    setTrace(null);

    try {
      const response = await fetch(`/api/blockchain/trace/${unitId}`);
      if (response.ok) {
        const data = await response.json();
        setTrace(data);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to trace blood unit');
      }
    } catch {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Blood Unit Trace</h1>
        <p className="text-gray-600">Track the complete lifecycle of a blood unit</p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="py-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter Blood Unit ID or Code"
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
              />
            </div>
            <Button onClick={handleTrace} loading={loading}>
              Trace
            </Button>
          </div>
          {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
        </CardContent>
      </Card>

      {/* Results */}
      {trace && (
        <>
          {/* Verification Status */}
          <Card className={trace.blockchainVerified ? 'border-green-200' : 'border-yellow-200'}>
            <CardContent className="py-4">
              <div className="flex items-center gap-2">
                {trace.blockchainVerified ? (
                  <>
                    <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium text-green-600">Blockchain Verified</span>
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium text-yellow-600">Blockchain verification unavailable</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Blood Unit Info */}
          <Card>
            <CardHeader>
              <CardTitle>Blood Unit Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Unit Code</p>
                  <p className="font-medium">{trace.bloodUnit.unitCode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Blood Group</p>
                  <p className="font-medium">{getBloodGroupDisplay(trace.bloodUnit.bloodGroup)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge variant={getStatusColor(trace.bloodUnit.status)}>
                    {trace.bloodUnit.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Collection Date</p>
                  <p className="font-medium">{formatDateTime(trace.bloodUnit.collectionDate)}</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Data Hash</p>
                <p className="font-mono text-xs break-all">{trace.bloodUnit.dataHash}</p>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Lifecycle Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Collection */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <div className="flex-1 w-px bg-gray-200" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Collection</p>
                    <p className="text-sm text-gray-500">
                      {formatDateTime(trace.bloodUnit.collectionDate)} at {trace.organization.name}
                    </p>
                  </div>
                </div>

                {/* Tests */}
                {trace.tests.map((test, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`h-3 w-3 rounded-full ${test.result === 'NEGATIVE' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <div className="flex-1 w-px bg-gray-200" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{test.testType} Test</p>
                      <p className="text-sm text-gray-500">
                        Result: {test.result} - {formatDateTime(test.testDate)}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Transfers */}
                {trace.transfers.map((transfer, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-blue-500" />
                      {i < trace.transfers.length - 1 && (
                        <div className="flex-1 w-px bg-gray-200" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Transfer</p>
                      <p className="text-sm text-gray-500">
                        {formatDateTime(transfer.transferDate)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { getBloodGroupDisplay, formatDate, getStatusColor } from '@/lib/utils';

interface BloodUnit {
  id: string;
  unitCode: string;
  bloodGroup: string;
  status: string;
  collectionDate: string;
  expiryDate: string;
  volumeMl?: number;
}

interface InventorySummary {
  bloodGroup: string;
  available: number;
  reserved: number;
  expiringIn7Days: number;
}

export default function InventoryPage() {
  const [units, setUnits] = useState<BloodUnit[]>([]);
  const [summary, setSummary] = useState<InventorySummary[]>([]);
  const [filter, setFilter] = useState({ bloodGroup: '', status: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInventory() {
      try {
        const [summaryRes, donationsRes] = await Promise.all([
          fetch('/api/inventory'),
          fetch('/api/donations?limit=100'),
        ]);

        if (summaryRes.ok) {
          const data = await summaryRes.json();
          setSummary(Array.isArray(data) ? data : []);
        }

        if (donationsRes.ok) {
          const data = await donationsRes.json();
          setUnits(data.donations || []);
        }
      } catch (error) {
        console.error('Failed to fetch inventory:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchInventory();
  }, []);

  const filteredUnits = units.filter((unit) => {
    if (filter.bloodGroup && unit.bloodGroup !== filter.bloodGroup) return false;
    if (filter.status && unit.status !== filter.status) return false;
    return true;
  });

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
        <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
        <p className="text-gray-600">View and manage blood units</p>
      </div>

      {/* Inventory Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'].map((bg) => {
          const inv = summary.find((i) => i.bloodGroup === bg);
          return (
            <Card key={bg}>
              <CardContent className="py-4 text-center">
                <span className="text-xl font-bold text-red-600">
                  {getBloodGroupDisplay(bg)}
                </span>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {inv?.available || 0}
                </p>
                <p className="text-xs text-gray-500">available</p>
                {inv?.expiringIn7Days ? (
                  <Badge variant="warning" className="mt-1 text-xs">
                    {inv.expiringIn7Days} expiring
                  </Badge>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex gap-4">
            <select
              value={filter.bloodGroup}
              onChange={(e) => setFilter({ ...filter, bloodGroup: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="">All Blood Groups</option>
              {['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'].map((bg) => (
                <option key={bg} value={bg}>{getBloodGroupDisplay(bg)}</option>
              ))}
            </select>

            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="RESERVED">Reserved</option>
              <option value="TESTING">Testing</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Units Table */}
      <Card>
        <CardHeader>
          <CardTitle>Blood Units ({filteredUnits.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUnits.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit Code</TableHead>
                  <TableHead>Blood Group</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Collection Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUnits.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell className="font-medium">{unit.unitCode}</TableCell>
                    <TableCell>
                      <Badge variant="info">{getBloodGroupDisplay(unit.bloodGroup)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(unit.status)}>
                        {unit.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(unit.collectionDate)}</TableCell>
                    <TableCell>{formatDate(unit.expiryDate)}</TableCell>
                    <TableCell>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        View Details
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No blood units found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

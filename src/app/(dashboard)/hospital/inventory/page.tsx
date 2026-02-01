'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { getBloodGroupDisplay } from '@/lib/utils';

interface InventoryItem {
  bloodGroup: string;
  available: number;
  reserved: number;
  expiringWithin7Days: number;
}

const BLOOD_GROUPS = [
  'A_POSITIVE', 'A_NEGATIVE',
  'B_POSITIVE', 'B_NEGATIVE',
  'AB_POSITIVE', 'AB_NEGATIVE',
  'O_POSITIVE', 'O_NEGATIVE',
];

export default function HospitalInventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/inventory?type=hospital');
      if (response.ok) {
        const data = await response.json();
        setInventory(data.inventory || []);
      } else {
        // Initialize with empty data if API fails
        setInventory(BLOOD_GROUPS.map(bg => ({
          bloodGroup: bg,
          available: 0,
          reserved: 0,
          expiringWithin7Days: 0,
        })));
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
      setInventory(BLOOD_GROUPS.map(bg => ({
        bloodGroup: bg,
        available: 0,
        reserved: 0,
        expiringWithin7Days: 0,
      })));
    } finally {
      setLoading(false);
    }
  };

  const totalAvailable = inventory.reduce((sum, item) => sum + item.available, 0);
  const totalReserved = inventory.reduce((sum, item) => sum + item.reserved, 0);
  const totalExpiring = inventory.reduce((sum, item) => sum + item.expiringWithin7Days, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Hospital Blood Inventory</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{totalAvailable}</div>
            <p className="text-sm text-gray-500">Total Available Units</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{totalReserved}</div>
            <p className="text-sm text-gray-500">Reserved Units</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{totalExpiring}</div>
            <p className="text-sm text-gray-500">Expiring in 7 Days</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-600">
              {inventory.filter(i => i.available === 0).length}
            </div>
            <p className="text-sm text-gray-500">Out of Stock Types</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory by Blood Group</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading inventory...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Blood Group</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Reserved</TableHead>
                  <TableHead>Expiring Soon</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item) => (
                  <TableRow key={item.bloodGroup}>
                    <TableCell>
                      <Badge variant="default" className="text-lg">
                        {getBloodGroupDisplay(item.bloodGroup)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-lg font-semibold">
                      {item.available}
                    </TableCell>
                    <TableCell>{item.reserved}</TableCell>
                    <TableCell>
                      {item.expiringWithin7Days > 0 ? (
                        <span className="text-yellow-600 font-medium">
                          {item.expiringWithin7Days}
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {item.available === 0 ? (
                        <Badge variant="destructive">Out of Stock</Badge>
                      ) : item.available < 5 ? (
                        <Badge variant="warning">Low Stock</Badge>
                      ) : (
                        <Badge variant="success">Available</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Blood Compatibility Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Can Receive From:</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li><strong>A+:</strong> A+, A-, O+, O-</li>
                <li><strong>A-:</strong> A-, O-</li>
                <li><strong>B+:</strong> B+, B-, O+, O-</li>
                <li><strong>B-:</strong> B-, O-</li>
                <li><strong>AB+:</strong> All types (Universal Recipient)</li>
                <li><strong>AB-:</strong> AB-, A-, B-, O-</li>
                <li><strong>O+:</strong> O+, O-</li>
                <li><strong>O-:</strong> O- only (Universal Donor)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Can Donate To:</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li><strong>A+:</strong> A+, AB+</li>
                <li><strong>A-:</strong> A+, A-, AB+, AB-</li>
                <li><strong>B+:</strong> B+, AB+</li>
                <li><strong>B-:</strong> B+, B-, AB+, AB-</li>
                <li><strong>AB+:</strong> AB+ only</li>
                <li><strong>AB-:</strong> AB+, AB-</li>
                <li><strong>O+:</strong> O+, A+, B+, AB+</li>
                <li><strong>O-:</strong> All types (Universal Donor)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

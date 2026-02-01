'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getBloodGroupDisplay } from '@/lib/utils';

interface InventorySummary {
  bloodGroup: string;
  available: number;
  reserved: number;
  expiringIn7Days: number;
}

interface StockAlert {
  bloodGroup: string;
  currentStock: number;
  minimumRequired: number;
  severity: 'LOW' | 'CRITICAL';
}

export default function BloodBankDashboard() {
  const [inventory, setInventory] = useState<InventorySummary[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [stats, setStats] = useState({
    todayDonations: 0,
    pendingTests: 0,
    pendingRequests: 0,
    availableUnits: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [dashboardRes, inventoryRes, alertsRes] = await Promise.all([
          fetch('/api/dashboard/blood-bank'),
          fetch('/api/inventory'),
          fetch('/api/inventory/alerts'),
        ]);

        if (dashboardRes.ok) {
          const data = await dashboardRes.json();
          setStats(data.stats || {
            todayDonations: 0,
            pendingTests: 0,
            pendingRequests: 0,
            availableUnits: 0,
          });
        }

        if (inventoryRes.ok) {
          const data = await inventoryRes.json();
          setInventory(Array.isArray(data) ? data : []);
        }

        if (alertsRes.ok) {
          const data = await alertsRes.json();
          setAlerts(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blood Bank Dashboard</h1>
          <p className="text-gray-600">Overview of your blood bank operations</p>
        </div>
        <a
          href="/blood-bank/donations/register"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 transition-colors cursor-pointer shadow-lg shadow-teal-600/25"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Donation
        </a>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 shadow-lg">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-amber-700 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-semibold">Stock Alerts</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {alerts.map((alert) => (
                <Badge
                  key={alert.bloodGroup}
                  variant={alert.severity === 'CRITICAL' ? 'danger' : 'warning'}
                >
                  {getBloodGroupDisplay(alert.bloodGroup)}: {alert.currentStock}/{alert.minimumRequired}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg shadow-gray-100/50 overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
          <div className="h-1 bg-gradient-to-r from-teal-400 to-cyan-500" />
          <CardContent className="py-5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-teal-50 flex items-center justify-center">
                <svg className="h-6 w-6 text-teal-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Today&apos;s Donations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayDonations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg shadow-gray-100/50 overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
          <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
          <CardContent className="py-5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center">
                <svg className="h-6 w-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending Tests</p>
                <p className="text-2xl font-bold text-amber-600">{stats.pendingTests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg shadow-gray-100/50 overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
          <div className="h-1 bg-gradient-to-r from-blue-400 to-indigo-500" />
          <CardContent className="py-5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending Requests</p>
                <p className="text-2xl font-bold text-blue-600">{stats.pendingRequests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg shadow-gray-100/50 overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
          <div className="h-1 bg-gradient-to-r from-emerald-400 to-green-500" />
          <CardContent className="py-5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Available Units</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.availableUnits}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Grid */}
      <Card className="border-0 shadow-lg shadow-gray-100/50">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center justify-between">
            <CardTitle>Blood Inventory</CardTitle>
            <a href="/blood-bank/inventory" className="text-sm text-teal-600 hover:text-teal-700 font-medium cursor-pointer">
              View Details
            </a>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'].map((bg) => {
              const inv = inventory.find((i) => i.bloodGroup === bg);
              return (
                <div key={bg} className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl text-center border border-gray-100 hover:border-teal-200 hover:shadow-lg transition-all cursor-pointer group">
                  <span className="text-2xl font-bold text-teal-600 group-hover:scale-110 inline-block transition-transform">
                    {getBloodGroupDisplay(bg)}
                  </span>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {inv?.available || 0}
                  </p>
                  <p className="text-sm text-gray-500">units available</p>
                  {inv?.expiringIn7Days ? (
                    <Badge variant="warning" className="mt-2">
                      {inv.expiringIn7Days} expiring soon
                    </Badge>
                  ) : null}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a
          href="/blood-bank/donations"
          className="group p-5 bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-100/50 hover:shadow-xl hover:border-teal-200 transition-all flex items-center gap-4 cursor-pointer"
        >
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-teal-500/25">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <span className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors">Register Donation</span>
            <p className="text-sm text-gray-500">Add new blood donations</p>
          </div>
        </a>

        <a
          href="/blood-bank/tests"
          className="group p-5 bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-100/50 hover:shadow-xl hover:border-blue-200 transition-all flex items-center gap-4 cursor-pointer"
        >
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/25">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <span className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Submit Test Results</span>
            <p className="text-sm text-gray-500">Update blood test status</p>
          </div>
        </a>

        <a
          href="/blood-bank/requests"
          className="group p-5 bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-100/50 hover:shadow-xl hover:border-emerald-200 transition-all flex items-center gap-4 cursor-pointer"
        >
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/25">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <span className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">Process Requests</span>
            <p className="text-sm text-gray-500">Manage blood requests</p>
          </div>
        </a>
      </div>
    </div>
  );
}

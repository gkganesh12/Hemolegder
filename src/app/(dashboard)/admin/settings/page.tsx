'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface SystemSettings {
  bloodExpiryDays: number;
  minDonationIntervalDays: number;
  lowStockThreshold: number;
  criticalStockThreshold: number;
  requireBlockchainVerification: boolean;
  enableEmailNotifications: boolean;
  enableSMSNotifications: boolean;
  auditLogRetentionDays: number;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    bloodExpiryDays: 42,
    minDonationIntervalDays: 56,
    lowStockThreshold: 10,
    criticalStockThreshold: 5,
    requireBlockchainVerification: true,
    enableEmailNotifications: true,
    enableSMSNotifications: false,
    auditLogRetentionDays: 365,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    alert('Settings saved successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Blood Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Blood Expiry Period (days)
              </label>
              <Input
                type="number"
                value={settings.bloodExpiryDays}
                onChange={(e) => setSettings({...settings, bloodExpiryDays: parseInt(e.target.value)})}
              />
              <p className="text-xs text-gray-500 mt-1">
                Standard whole blood shelf life is 42 days
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Minimum Donation Interval (days)
              </label>
              <Input
                type="number"
                value={settings.minDonationIntervalDays}
                onChange={(e) => setSettings({...settings, minDonationIntervalDays: parseInt(e.target.value)})}
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum days between whole blood donations
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Low Stock Threshold
              </label>
              <Input
                type="number"
                value={settings.lowStockThreshold}
                onChange={(e) => setSettings({...settings, lowStockThreshold: parseInt(e.target.value)})}
              />
              <p className="text-xs text-gray-500 mt-1">
                Units per blood group to trigger low stock alert
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Critical Stock Threshold
              </label>
              <Input
                type="number"
                value={settings.criticalStockThreshold}
                onChange={(e) => setSettings({...settings, criticalStockThreshold: parseInt(e.target.value)})}
              />
              <p className="text-xs text-gray-500 mt-1">
                Units per blood group to trigger critical alert
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Blockchain Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Require Blockchain Verification</p>
                <p className="text-sm text-gray-500">
                  All blood unit operations require blockchain confirmation
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.requireBlockchainVerification}
                  onChange={(e) => setSettings({...settings, requireBlockchainVerification: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-500">
                  Send email alerts for important events
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableEmailNotifications}
                  onChange={(e) => setSettings({...settings, enableEmailNotifications: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">SMS Notifications</p>
                <p className="text-sm text-gray-500">
                  Send SMS alerts for urgent events
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableSMSNotifications}
                  onChange={(e) => setSettings({...settings, enableSMSNotifications: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audit & Compliance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Audit Log Retention (days)
              </label>
              <Input
                type="number"
                value={settings.auditLogRetentionDays}
                onChange={(e) => setSettings({...settings, auditLogRetentionDays: parseInt(e.target.value)})}
              />
              <p className="text-xs text-gray-500 mt-1">
                How long to keep audit logs before archiving
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
              <h4 className="font-medium text-red-800">Reset System</h4>
              <p className="text-sm text-red-600 mt-1">
                This will reset all system settings to defaults. This action cannot be undone.
              </p>
              <Button variant="destructive" size="sm" className="mt-3">
                Reset to Defaults
              </Button>
            </div>
            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
              <h4 className="font-medium text-red-800">Clear Test Data</h4>
              <p className="text-sm text-red-600 mt-1">
                Remove all test/seed data from the system. Production data will not be affected.
              </p>
              <Button variant="destructive" size="sm" className="mt-3">
                Clear Test Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface ReportConfig {
  id: string;
  name: string;
  description: string;
  type: string;
}

const AVAILABLE_REPORTS: ReportConfig[] = [
  {
    id: 'inventory-summary',
    name: 'Inventory Summary Report',
    description: 'Overview of blood inventory across all blood banks',
    type: 'INVENTORY',
  },
  {
    id: 'donation-stats',
    name: 'Donation Statistics',
    description: 'Monthly donation trends and donor demographics',
    type: 'DONATIONS',
  },
  {
    id: 'blood-usage',
    name: 'Blood Usage Report',
    description: 'Analysis of blood unit utilization by hospitals',
    type: 'USAGE',
  },
  {
    id: 'expiry-report',
    name: 'Expiry & Wastage Report',
    description: 'Tracking of expired and wasted blood units',
    type: 'WASTAGE',
  },
  {
    id: 'compliance-audit',
    name: 'Compliance Audit Report',
    description: 'Regulatory compliance status across organizations',
    type: 'COMPLIANCE',
  },
  {
    id: 'traceability',
    name: 'Traceability Report',
    description: 'Complete blood unit journey from donor to recipient',
    type: 'TRACEABILITY',
  },
];

export default function RegulatorReportsPage() {
  const [generating, setGenerating] = useState<string | null>(null);

  const handleGenerateReport = async (reportId: string) => {
    setGenerating(reportId);
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setGenerating(null);
    alert(`Report ${reportId} generated successfully. Download will start shortly.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Regulatory Reports</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">6</div>
            <p className="text-sm text-gray-500">Available Reports</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">0</div>
            <p className="text-sm text-gray-500">Generated This Month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-600">0</div>
            <p className="text-sm text-gray-500">Scheduled Reports</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AVAILABLE_REPORTS.map((report) => (
              <div
                key={report.id}
                className="border rounded-lg p-4 flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-semibold text-lg">{report.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{report.description}</p>
                  <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    {report.type}
                  </span>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleGenerateReport(report.id)}
                    disabled={generating === report.id}
                  >
                    {generating === report.id ? 'Generating...' : 'Generate'}
                  </Button>
                  <Button variant="outline" size="sm">
                    Schedule
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Report History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No reports have been generated yet. Select a report above to get started.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Custom Report Builder</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              Need a custom report? Use our report builder to create tailored reports
              based on specific criteria.
            </p>
            <Button variant="outline">Open Report Builder</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

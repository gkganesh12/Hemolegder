'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getBloodGroupDisplay, formatDate } from '@/lib/utils';

interface DonorProfile {
  id: string;
  name: string;
  bloodGroup: string;
  isEligible: boolean;
  lastDonationDate: string | null;
  donations: Array<{
    id: string;
    unitCode: string;
    status: string;
    collectionDate: string;
  }>;
}

export default function DonorDashboard() {
  const [profile, setProfile] = useState<DonorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch('/api/donors/me');
        if (response.ok) {
          const data = await response.json();
          setProfile(data.profile);
        } else {
          setError('Failed to load profile');
        }
      } catch (err) {
        setError('Failed to load profile');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Welcome Message */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Donor Dashboard</h1>
          <p className="text-gray-600">
            Welcome{profile?.name ? `, ${profile.name}` : ' to your donor portal'}
          </p>
        </div>
        {profile?.isEligible && (
          <a
            href="/blood-bank"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 transition-colors cursor-pointer shadow-lg shadow-teal-600/25"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            Donate Now
          </a>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg shadow-gray-100/50 overflow-hidden">
          <div className={`h-1 ${profile?.isEligible ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-amber-400 to-orange-500'}`} />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Eligibility Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${profile?.isEligible ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                <svg className={`w-6 h-6 ${profile?.isEligible ? 'text-emerald-600' : 'text-amber-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {profile?.isEligible ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  )}
                </svg>
              </div>
              <div>
                <Badge variant={profile?.isEligible ? 'success' : 'warning'}>
                  {profile?.isEligible ? 'Eligible to Donate' : 'Not Eligible Yet'}
                </Badge>
                {profile?.lastDonationDate && (
                  <p className="mt-1 text-xs text-gray-500">
                    Last: {formatDate(profile.lastDonationDate)}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg shadow-gray-100/50 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-teal-400 to-cyan-500" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Blood Group</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center">
                <svg className="w-6 h-6 text-teal-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
              <span className="text-3xl font-bold text-teal-600">
                {profile?.bloodGroup ? getBloodGroupDisplay(profile.bloodGroup) : 'Not Set'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg shadow-gray-100/50 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-purple-400 to-pink-500" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Donations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <span className="text-3xl font-bold text-gray-900">
                  {profile?.donations?.length || 0}
                </span>
                <p className="text-sm text-gray-500">lifetime donations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Complete Profile CTA */}
      {!profile && (
        <Card className="border-0 shadow-lg shadow-gray-100/50 bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100">
          <CardContent className="py-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-white flex items-center justify-center mb-4 shadow-lg">
              <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Complete Your Profile
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              You haven&apos;t set up your donor profile yet. Complete your profile to start donating and save lives.
            </p>
            <a
              href="/donor/profile"
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 transition-colors cursor-pointer shadow-lg shadow-teal-600/25"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Set Up Profile
            </a>
          </CardContent>
        </Card>
      )}

      {/* Recent Donations */}
      <Card className="border-0 shadow-lg shadow-gray-100/50">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center justify-between">
            <CardTitle>Recent Donations</CardTitle>
            {profile?.donations && profile.donations.length > 0 && (
              <a href="/donor/history" className="text-sm text-teal-600 hover:text-teal-700 font-medium cursor-pointer">
                View All
              </a>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {profile?.donations && profile.donations.length > 0 ? (
            <div className="space-y-3">
              {profile.donations.slice(0, 5).map((donation, index) => (
                <div
                  key={donation.id}
                  className="flex items-center justify-between p-4 bg-gray-50 hover:bg-teal-50/50 rounded-xl transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-teal-600 font-bold shadow-sm group-hover:shadow-md transition-shadow">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{donation.unitCode}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(donation.collectionDate)}
                      </p>
                    </div>
                  </div>
                  <Badge variant="success">{donation.status.replace('_', ' ')}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-600 mb-2">No donations yet</p>
              <p className="text-sm text-gray-500">Start your donation journey today!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

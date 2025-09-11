import { TrendingUp, UserCheck, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ApiService } from '../services/api';
import { DashboardSummary, RSVPAnalytics, UploadAnalytics } from '../types/api';
import { Badge } from './ui/badge';
import { Button } from './ui/button-pers';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';

interface AdminStatsProps {
  className?: string;
}

export function AdminStats({ className }: AdminStatsProps) {
  const [dashboardSummary, setDashboardSummary] =
    useState<DashboardSummary | null>(null);
  const [rsvpAnalytics, setRsvpAnalytics] = useState<RSVPAnalytics | null>(
    null,
  );
  const [uploadAnalytics, setUploadAnalytics] =
    useState<UploadAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [summary, rsvp, uploads] = await Promise.all([
        ApiService.getDashboardSummary(),
        ApiService.getRSVPAnalytics(),
        ApiService.getUploadAnalytics(),
      ]);

      setDashboardSummary(summary);
      setRsvpAnalytics(rsvp);
      setUploadAnalytics(uploads);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const blob = await ApiService.exportGuestsCSV();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `guests-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export CSV:', err);
      setError('Failed to export guest data');
    }
  };

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString();

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p className="mb-4">{error}</p>
              <Button onClick={loadAnalytics} variant="outline">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardSummary?.totalGuests || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Invited to the wedding
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(dashboardSummary?.responseRate || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Have responded to invitation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Attendance Rate
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(dashboardSummary?.attendanceRate || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Confirmed attendance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Confirmed Attendees
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardSummary?.confirmedAttendees || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total people attending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RSVP Overview */}
        <Card>
          <CardHeader>
            <CardTitle>RSVP Overview</CardTitle>
            <CardDescription>Detailed response statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {rsvpAnalytics && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Confirmed</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant="success">
                      {rsvpAnalytics.overview.totalConfirmed}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatPercentage(
                        (rsvpAnalytics.overview.totalConfirmed /
                          rsvpAnalytics.overview.totalGuests) *
                          100,
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Declined</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant="destructive">
                      {rsvpAnalytics.overview.totalDeclined}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatPercentage(
                        (rsvpAnalytics.overview.totalDeclined /
                          rsvpAnalytics.overview.totalGuests) *
                          100,
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Pending</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {rsvpAnalytics.overview.totalPending}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatPercentage(
                        (rsvpAnalytics.overview.totalPending /
                          rsvpAnalytics.overview.totalGuests) *
                          100,
                      )}
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Average Party Size
                    </span>
                    <span className="text-sm font-semibold">
                      {rsvpAnalytics.attendance.averagePartySize.toFixed(1)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest RSVP responses</CardDescription>
          </CardHeader>
          <CardContent>
            {rsvpAnalytics?.recentActivity.length ? (
              <div className="space-y-3">
                {rsvpAnalytics.recentActivity
                  .slice(0, 5)
                  .map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            activity.action === 'confirmed'
                              ? 'success'
                              : 'destructive'
                          }
                        >
                          {activity.action === 'confirmed' ? '✓' : '✗'}
                        </Badge>
                        <span className="text-sm font-medium">
                          {activity.guestName}
                        </span>
                        {activity.confirmedPartySize && (
                          <span className="text-xs text-muted-foreground">
                            ({activity.confirmedPartySize} people)
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(activity.timestamp)}
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No recent activity
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Demographics and Upload Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Demographics */}
        <Card>
          <CardHeader>
            <CardTitle>Guest Demographics</CardTitle>
            <CardDescription>
              Contact information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {rsvpAnalytics && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Phone Numbers</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold">
                      {rsvpAnalytics.demographics.phoneNumberProvided.count}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      (
                      {formatPercentage(
                        rsvpAnalytics.demographics.phoneNumberProvided
                          .percentage,
                      )}
                      )
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Email Addresses</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold">
                      {rsvpAnalytics.demographics.emailProvided.count}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      (
                      {formatPercentage(
                        rsvpAnalytics.demographics.emailProvided.percentage,
                      )}
                      )
                    </span>
                  </div>
                </div>
                {rsvpAnalytics.demographics.dietaryRestrictions.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium mb-2">
                      Dietary Restrictions
                    </p>
                    <div className="space-y-1">
                      {rsvpAnalytics.demographics.dietaryRestrictions
                        .slice(0, 3)
                        .map((restriction, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center text-xs"
                          >
                            <span>{restriction.restriction}</span>
                            <span className="text-muted-foreground">
                              {restriction.count} (
                              {formatPercentage(restriction.percentage)})
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Upload Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Statistics</CardTitle>
            <CardDescription>CSV upload performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {uploadAnalytics && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Uploads</span>
                  <span className="text-sm font-semibold">
                    {uploadAnalytics.totalUploads}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Successful</span>
                  <Badge variant="success">
                    {uploadAnalytics.successfulUploads}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Failed</span>
                  <Badge variant="destructive">
                    {uploadAnalytics.failedUploads}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Guests Imported</span>
                  <span className="text-sm font-semibold">
                    {uploadAnalytics.totalGuestsImported}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Avg per Upload</span>
                  <span className="text-sm font-semibold">
                    {uploadAnalytics.averageGuestsPerUpload.toFixed(1)}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

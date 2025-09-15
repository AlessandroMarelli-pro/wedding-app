import { IconMessage } from '@tabler/icons-react';
import { TrendingUp, UserCheck, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ApiService } from '../../services/api';
import {
  DashboardSummary,
  RSVPAnalytics,
  UploadAnalytics,
} from '../../types/api';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button-pers';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { CustomTooltip } from '../ui/tooltip';

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

      const [analytics, uploads] = await Promise.all([
        ApiService.getRSVPAnalytics(),
        ApiService.getUploadAnalytics(),
      ]);

      setDashboardSummary({
        totalGuests: analytics.overview.totalGuests,
        responseRate: analytics.overview.responseRate,
        attendanceRate: analytics.overview.attendanceRate,
        confirmedAttendees: analytics.attendance.confirmedAttendees,
        recentResponses: analytics.recentActivity.length,
        pendingInvitations: analytics.overview.totalPending,
      });
      setRsvpAnalytics(analytics);
      setUploadAnalytics(uploads);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatPercentage = (value: number) =>
    (value && `${value.toFixed(1)}%`) || '0%';
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

  const mainStats = [
    {
      title: 'Invités',
      value: dashboardSummary?.totalGuests || 0,
      description: 'Invité au mariage',
      icon: Users,
    },
    {
      title: 'Taux de réponse',
      value: `${dashboardSummary?.responseRate || 0} %`,
      description: "Répondu à l'invitation",
      icon: TrendingUp,
    },
    {
      title: 'Taux de présence',
      value: `${dashboardSummary?.attendanceRate || 0} %`,
      description: 'Présence confirmée',
      icon: UserCheck,
    },
    {
      title: 'Confirmés',
      value: dashboardSummary?.confirmedAttendees || 0,
      description: 'Total de personnes présentes',
      icon: UserCheck,
    },
  ];
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RSVP Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Récapitulatif des réponses</CardTitle>
            <CardDescription>Statistiques des réponses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {rsvpAnalytics && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Confirmés</span>
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
                  <span className="text-sm font-medium">Déclinés</span>
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
                  <span className="text-sm font-medium">En attente</span>
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
                      Taille moyenne des groupes
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
            <CardTitle>Activité récente</CardTitle>
            <CardDescription>Dernières réponses</CardDescription>
          </CardHeader>
          <CardContent>
            {rsvpAnalytics?.recentActivity.length ? (
              <div className="space-y-3 h-[10rem] overflow-y-scroll scrollbar">
                {rsvpAnalytics.recentActivity.map((activity, index) => (
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
                      {activity?.confirmedPartySize &&
                        activity.confirmedPartySize > 0 && (
                          <span className="text-xs text-muted-foreground">
                            ({activity.confirmedPartySize} personne
                            {activity.confirmedPartySize > 1 ? 's' : ''})
                          </span>
                        )}
                    </div>

                    <span className="text-xs text-muted-foreground flex flex-row items-center gap-2">
                      {activity.message && (
                        <CustomTooltip
                          Icon={IconMessage}
                          text={activity.message || ''}
                        />
                      )}
                      {formatDate(activity.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aucune activité récente
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
            <CardTitle>Demographie des invités</CardTitle>
            <CardDescription>
              Informations de contact et préférences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {rsvpAnalytics && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    Numéros de téléphone
                  </span>
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
                  <span className="text-sm font-medium">Adresses email</span>
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
                      Restrictions alimentaires
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
            <CardTitle>Statistiques des dépôts</CardTitle>
            <CardDescription>Performance des dépôts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {uploadAnalytics && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total dépôts</span>
                  <span className="text-sm font-semibold">
                    {uploadAnalytics.totalUploads}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Succès</span>
                  <Badge variant="success">
                    {uploadAnalytics.successfulUploads}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Échec</span>
                  <Badge variant="destructive">
                    {uploadAnalytics.failedUploads}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Invités importés</span>
                  <span className="text-sm font-semibold">
                    {uploadAnalytics.totalGuestsImported}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Moyenne par dépôt</span>
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

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { cn } from '@/lib';
import { Users } from 'lucide-react';

import { CheckCircle, Clock, X } from 'lucide-react';

interface Guest {
  id: string;
  hashCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  partySize: number;
  dietaryRestrictions: string;
  specialRequests: string;
  createdAt: string;
  rsvpConfirmation?: {
    id: string;
    isAttending: boolean;
    confirmedPartySize: number;
    message: string;
    confirmedAt: string;
  };
}

export const GuestsStats = ({ guests }: { guests: Guest[] }) => {
  const stats = {
    total: guests.reduce((sum, g) => sum + (g.partySize || 0), 0),
    // Sum confirmed party size
    confirmed: guests
      .filter((g) => g.rsvpConfirmation?.isAttending === true)
      .reduce(
        (sum, g) => sum + (g.rsvpConfirmation?.confirmedPartySize || 0),
        0,
      ),
    declined:
      guests
        .filter((g) => g.rsvpConfirmation?.isAttending === false)
        .reduce((sum, g) => sum + (g.partySize || 0), 0) +
      guests
        .filter((g) => g.rsvpConfirmation?.isAttending === true)
        .reduce(
          (sum, g) =>
            sum + (g.partySize - (g.rsvpConfirmation?.confirmedPartySize || 0)),
          0,
        ),
    pending: guests
      .filter((g) => !g.rsvpConfirmation)
      .reduce((sum, g) => sum + (g.partySize || 0), 0),
  };

  const data = [
    {
      title: 'Invités',
      value: stats.total,
      icon: Users,
      color: 'blue',
    },
    {
      title: 'Confirmés',
      value: stats.confirmed,
      icon: CheckCircle,
      color: 'green',
    },
    {
      title: 'Déclinés',
      value: stats.declined,
      icon: X,
      color: 'red',
    },
    {
      title: 'En attente',
      value: stats.pending,
      icon: Clock,
      color: 'yellow',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {data.map((item) => (
        <Card key={item.title} className={`bg-${item.color}-50`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 lg:p-6">
            <CardTitle className="lg:text-lg font-medium">
              {item.title}
            </CardTitle>
            <item.icon
              className={cn('size-4 lg:size-6 ', `text-${item.color}-500`)}
            />
          </CardHeader>
          <CardContent className="">
            <div className="text-xl lg:text-3xl font-bold">{item.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

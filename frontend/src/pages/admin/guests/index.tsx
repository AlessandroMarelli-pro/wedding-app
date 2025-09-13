import { GuestsCsvUpload } from '@/components/admin/guests-csv-upload';
import { GuestsList } from '@/components/admin/guests-list';
import { GuestsStats } from '@/components/admin/guests-stats';
import { LoadingSpinner } from '@/components/ui/loading';
import { useToast } from '@/hooks/use-toast';
import Head from 'next/head';
import { useEffect, useState } from 'react';

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

interface CSVUpload {
  id: string;
  filename: string;
  totalGuests: number;
  successfulImports: number;
  createdAt: string;
}

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [csvUploads, setCsvUploads] = useState<CSVUpload[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    console.log('fetching data', process.env.NEXT_PUBLIC_API_URL);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No admin token found');
      }

      const guestsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/guests`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (guestsResponse.ok) {
        const guestsData = await guestsResponse.json();

        setGuests(guestsData);
      }

      const uploadsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/guests/uploads`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (uploadsResponse.ok) {
        const uploadsData = await uploadsResponse.json();

        setCsvUploads(uploadsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch guest data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Head>
        <title>Guest Management - Wedding Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="p-6 space-y-8">
        <div>
          <h1 className="text-3xl  text-foreground flex items-center gap-2 mb-2 justify-between">
            Guest Management
          </h1>
          <p className="text-gray-600">
            Manage your wedding guest list and RSVP responses
          </p>
        </div>

        {/* Stats Cards */}
        <GuestsStats guests={guests} />

        {/* CSV Upload Section */}
        <GuestsCsvUpload fetchData={fetchData} csvUploads={csvUploads} />

        {/* Guest Details Modal */}
        <GuestsList fetchData={fetchData} guests={guests} />
      </div>
    </>
  );
}

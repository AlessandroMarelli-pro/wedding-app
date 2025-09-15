import { Input } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

import { Guest } from '@/types/api';
import { useState } from 'react';
import { toast } from 'sonner';
import { ApiService } from '../../services/api';
import { GuestsTable } from './guests-table';

export const GuestsList = ({
  fetchData,
  guests,
}: {
  fetchData: () => void;
  guests: Guest[];
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const [statusFilter, setStatusFilter] = useState<
    'all' | 'confirmed' | 'declined' | 'pending'
  >('all');
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleDeleteGuest = async (
    guestId: string,
    firstName: string,
    lastName: string,
  ) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No admin token found');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/guests/${guestId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error('Failed to delete guest');
      }

      toast.success('Invité supprimé avec succès !', {
        description: `${firstName} ${lastName} a été supprimé.`,
      });

      fetchData(); // Refresh the data
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error('Erreur lors de la suppression du guest !', {
        description: error?.message,
      });
    }
  };

  const filteredGuests = guests.filter((guest) => {
    const matchesSearch =
      guest.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.hashCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'confirmed' &&
        guest.rsvpConfirmation?.isAttending === true) ||
      (statusFilter === 'declined' &&
        guest.rsvpConfirmation?.isAttending === false) ||
      (statusFilter === 'pending' && !guest.rsvpConfirmation);

    return matchesSearch && matchesStatus;
  });

  const frenchStatuses = {
    all: 'Tous',
    confirmed: 'Confirmés',
    declined: 'Déclinés',
    pending: 'En attente',
  };

  return (
    <>
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search guests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'confirmed', 'declined', 'pending'] as const).map(
            (status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                onClick={() => setStatusFilter(status)}
              >
                {frenchStatuses[status as keyof typeof frenchStatuses]}
              </Button>
            ),
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={handleExportCSV}>
            <Download className="h-4 w-4" />
            <span>Exporter les données (CSV)</span>
          </Button>
        </div>
      </div>
      <GuestsTable
        data={filteredGuests}
        handleDeleteGuest={handleDeleteGuest}
      />
    </>
  );
};

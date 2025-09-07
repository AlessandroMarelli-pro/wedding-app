import { Badge, Button } from '@/components/ui';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Calendar,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  Users,
  X,
} from 'lucide-react';

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

interface GuestDetailsModalProps {
  guest: Guest | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (guestId: string) => void;
}

export function GuestDetailsModal({
  guest,
  isOpen,
  onClose,
  onDelete,
}: GuestDetailsModalProps) {
  if (!guest) return null;

  const getStatusInfo = () => {
    if (!guest.rsvpConfirmation) {
      return {
        status: 'Pending Response',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: <Clock className="w-4 h-4" />,
      };
    }

    if (guest.rsvpConfirmation.isAttending) {
      return {
        status: `Confirmed (${guest.rsvpConfirmation.confirmedPartySize} attending)`,
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: <CheckCircle className="w-4 h-4" />,
      };
    }

    return {
      status: 'Declined',
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: <X className="w-4 h-4" />,
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>
              {guest.firstName} {guest.lastName}
            </span>
            <Badge variant="outline" className="font-mono text-sm">
              {guest.hashCode}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              RSVP Status
            </h3>
            <Badge className={statusInfo.color}>
              {statusInfo.icon}
              <span className="ml-2">{statusInfo.status}</span>
            </Badge>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Contact Information
            </h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-3 text-gray-400" />
                <span className="text-sm">{guest.email}</span>
              </div>
              {guest.phoneNumber && (
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-3 text-gray-400" />
                  <span className="text-sm">{guest.phoneNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Party Information */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Party Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-sm">
                  Original party size: {guest.partySize}
                </span>
              </div>
              {guest.rsvpConfirmation && (
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-sm">
                    Confirmed attendees:{' '}
                    {guest.rsvpConfirmation.confirmedPartySize}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Special Requirements */}
          {(guest.dietaryRestrictions || guest.specialRequests) && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Special Requirements
              </h3>
              <div className="space-y-2">
                {guest.dietaryRestrictions && (
                  <div className="p-3 bg-gray-50 rounded-md">
                    <span className="text-sm font-medium text-gray-700">
                      Dietary Restrictions:{' '}
                    </span>
                    <span className="text-sm text-gray-600">
                      {guest.dietaryRestrictions}
                    </span>
                  </div>
                )}
                {guest.specialRequests && (
                  <div className="p-3 bg-gray-50 rounded-md">
                    <span className="text-sm font-medium text-gray-700">
                      Special Requests:{' '}
                    </span>
                    <span className="text-sm text-gray-600">
                      {guest.specialRequests}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* RSVP Message */}
          {guest.rsvpConfirmation?.message && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                RSVP Message
              </h3>
              <div className="p-4 bg-blue-50 rounded-md border-l-4 border-blue-200">
                <p className="text-sm text-gray-700 italic">
                  "{guest.rsvpConfirmation.message}"
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Submitted on{' '}
                  {new Date(
                    guest.rsvpConfirmation.confirmedAt,
                  ).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Timeline</h3>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-gray-600">
                  Added to guest list:{' '}
                  {new Date(guest.createdAt).toLocaleString()}
                </span>
              </div>
              {guest.rsvpConfirmation && (
                <div className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  <span className="text-gray-600">
                    RSVP submitted:{' '}
                    {new Date(
                      guest.rsvpConfirmation.confirmedAt,
                    ).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (
                  confirm(
                    `Are you sure you want to delete ${guest.firstName} ${guest.lastName}?`,
                  )
                ) {
                  onDelete(guest.id);
                  onClose();
                }
              }}
            >
              Delete Guest
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

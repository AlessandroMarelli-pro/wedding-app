import {
  Modal,
  ModalBody,
  ModalContent,
  ModalTrigger,
} from '@/components/ui/animated-modal';
import { RSVPForm } from './rsvp-form';

interface RSVPFormProps {
  className?: string;
}

interface GuestInfo {
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  partySize: number;
  dietaryRestrictions?: string;
  specialRequests?: string;
  confirmed: boolean;
}

interface RSVPFormData {
  isAttending: boolean;
  confirmedPartySize: number;
  message?: string;
}

type FormStep = 'hash-entry' | 'rsvp-details' | 'confirmation';

export function RSVPFormModal() {
  return (
    <div className=" flex items-center justify-center">
      <Modal>
        <ModalTrigger className="bg-black text-white px-6 sm:px-8 py-3  font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
          Confirmer votre présence
        </ModalTrigger>
        <ModalBody>
          <ModalContent className="bg-white border-none">
            <RSVPForm />
          </ModalContent>
        </ModalBody>
      </Modal>
    </div>
  );
}

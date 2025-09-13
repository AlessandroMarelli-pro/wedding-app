import {
  Modal,
  ModalBody,
  ModalContent,
  ModalTrigger,
} from '@/components/ui/animated-modal';
import { cn } from '@/lib';
import { RSVPForm } from './rsvp-form';

interface RSVPFormProps {
  btnColor?: string;
  btnTextColor?: string;
  shadowCls?: string;
  containerCls?: string;
}

export function RSVPFormModal({
  btnColor,
  btnTextColor,
  shadowCls = 'shadow-lg',
  containerCls = '',
}: RSVPFormProps) {
  return (
    <div
      className={cn(' flex items-center justify-center z-10 ', containerCls)}
    >
      <Modal>
        <ModalTrigger
          className={cn(
            ' px-6 sm:px-8 py-3  font-medium  hover:shadow-xl transform hover:scale-105 transition-all duration-300',
            btnColor,
            btnTextColor,
            shadowCls,
          )}
        >
          Confirmer votre présence
        </ModalTrigger>
        <ModalBody className="w-auto max-w-[95%] lg:max-w-[70vw] z-[1000000] ">
          <ModalContent className="bg-white border-none">
            <RSVPForm />
          </ModalContent>
        </ModalBody>
      </Modal>
    </div>
  );
}

import { IconMoodSmileBeam } from '@tabler/icons-react';
import { MessageSquare, MousePointerClick, Users } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button-pers';
import { Input } from './ui/input';
import { Label } from './ui/label';

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

export function RSVPForm({ className = '' }: RSVPFormProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>('hash-entry');
  const [hashCode, setHashCode] = useState('');
  const [guestInfo, setGuestInfo] = useState<GuestInfo | null>(null);
  const [rsvpData, setRSVPData] = useState<RSVPFormData>({
    isAttending: true,
    confirmedPartySize: 1,
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [confirmedGuest, setConfirmedGuest] = useState<string | null>(null);

  const handleHashSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hashCode.trim()) {
      setMessage({
        type: 'error',
        text: "Merci d'entrer votre code d'invitation.",
      });
      return;
    }

    if (hashCode.length !== 8) {
      setMessage({
        type: 'error',
        text: "Le code d'invitation doit être exactement de 8 caractères.",
      });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/rsvp/guest/${hashCode.toUpperCase()}`,
      );

      const data = await response.json();

      if (response.ok && !data.error) {
        if (data.confirmed) {
          setMessage({
            type: 'error',
            text: "Ce code d'invitation a déjà été utilisé pour confirmer la présence.",
          });
        } else {
          setGuestInfo(data);
          setRSVPData((prev) => ({
            ...prev,
            confirmedPartySize: data.partySize,
          }));
          setCurrentStep('rsvp-details');
        }
      } else {
        setMessage({
          type: 'error',
          text:
            data.error ||
            "Code d'invitation invalide. Veuillez vérifier et réessayer.",
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erreur réseau. Veuillez vérifier votre connexion et réessayer.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRSVPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!guestInfo) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/rsvp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            hashCode: hashCode.toUpperCase(),
            isAttending: rsvpData.isAttending,
            confirmedPartySize: rsvpData.isAttending
              ? rsvpData.confirmedPartySize
              : 0,
            message: rsvpData.message?.trim() || undefined,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        setConfirmedGuest(`${guestInfo.firstName} ${guestInfo.lastName}`);
        setMessage({ type: 'success', text: data.message });
        setCurrentStep('confirmation');
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Échec de la confirmation. Veuillez réessayer.',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erreur réseau. Veuillez vérifier votre connexion et réessayer.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCurrentStep('hash-entry');
    setHashCode('');
    setGuestInfo(null);
    setRSVPData({
      isAttending: true,
      confirmedPartySize: 1,
      message: '',
    });
    setConfirmedGuest(null);
    setMessage(null);
  };

  // Step 3: Confirmation Screen
  if (currentStep === 'confirmation' && confirmedGuest) {
    return (
      <div
        className={`  p-8  ${className} flex flex-col justify-center items-center`}
      >
        <div className="text-center">
          <h3 className="text-xl lg:text-2xl  text-[#F38181] mb-4 flex items-center justify-center gap-2">
            Votre venue est confirmée <IconMoodSmileBeam className="w-8 h-8" />
          </h3>
          <p className="text-base lg:text-lg text-gray-700 ">
            Merci{' '}
            <span className="font-medium text-rose-700">{confirmedGuest}</span>{' '}
            {rsvpData.confirmedPartySize === 1 ? '' : 'et vous tous'} d'avoir
            confirmé votre venue,
          </p>
          <p className="text-base lg:text-lg text-gray-700 mb-6">
            nous sommes si heureux de fêter ça avec vous !
          </p>

          <Button
            onClick={resetForm}
            variant="outline"
            className="text-rose-600 hover:text-rose-700 border-rose-200 hover:border-rose-300"
          >
            Confirmer pour un autre invité
          </Button>
        </div>
      </div>
    );
  }

  // Step 1: Hash Code Entry
  if (currentStep === 'hash-entry') {
    return (
      <div className={` p-8   ${className} `}>
        <form onSubmit={handleHashSubmit} className="space-y-6 ">
          <div className="flex flex-col items-center justify-center gap-4">
            <Label
              htmlFor="hashCode"
              className="text-lg font-medium text-gray-700"
            >
              Code d'invitation
            </Label>
            <Input
              type="text"
              id="hashCode"
              value={hashCode}
              onChange={(e) => {
                const value = e.target.value
                  .toUpperCase()
                  .replace(/[^A-Z0-9]/g, '');
                if (value.length <= 8) {
                  setHashCode(value);
                }
              }}
              placeholder=""
              className="text-lg text-center  font-mono mt-2"
              maxLength={8}
              disabled={isSubmitting}
            />
            <Label
              htmlFor="hashCode"
              className="text-xs text-muted-foreground "
            >
              Entrez votre code à 8 caractères qui figure sur votre invitation
            </Label>
            {message && (
              <div
                className={`p-4 rounded-lg ${
                  message.type === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}
              >
                <p className="font-medium">{message.text}</p>
              </div>
            )}
            <Button
              size="lg"
              type="submit"
              disabled={isSubmitting || hashCode.length !== 8}
              className="bg-[#F38181] text-white px-6 sm:px-8 py-3  font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              {isSubmitting ? 'Vérification...' : 'Continuer'}{' '}
              <MousePointerClick className="pl-2 h-8 w-8" />
            </Button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-rose-100">
          <p className="text-xs text-gray-600 text-center">
            Un problème ? Contactez-nous à{' '}
            <a
              href="mailto:wedding@example.com"
              className="text-rose-600 hover:text-rose-700 font-medium"
            >
              wedding@exemple.com
            </a>
          </p>
        </div>
      </div>
    );
  }

  // Step 2: RSVP Details Form
  if (currentStep === 'rsvp-details' && guestInfo) {
    return (
      <div className={` p-4 w-full ${className}`}>
        <div className="text-center lg:mb-6">
          <h2 className="text-2xl lg:text-3xl  font-bold text-[#F38181] mb-2">
            Bonjour {guestInfo.firstName} !
          </h2>
          <p className="text-gray-600 text-sm lg:text-base">
            Veuillez confirmer les détails de votre présence
          </p>
        </div>

        <form onSubmit={handleRSVPSubmit} className="space-y-6">
          {/* Guest Information Display */}

          <div className="flex flex-col lg:flex-row gap-4 lg:justify-between justify-around">
            <div className="flex flex-col lg:justify-left lg:items-left lg:text-left">
              <div>
                <Label className="lg:text-md text-sm font-bold text-[#F38181]">
                  Nom
                </Label>
                <p className="text-gray-800  p-2 pl-0 text-sm lg:text-base">
                  {guestInfo.firstName} {guestInfo.lastName}
                </p>
              </div>
              {guestInfo.email && (
                <div>
                  <Label className="lg:text-md text-sm font-bold text-[#F38181]">
                    Email
                  </Label>
                  <p className="text-gray-800  p-2 pl-0 text-sm lg:text-base">
                    {guestInfo.email}
                  </p>
                </div>
              )}
            </div>
            {(guestInfo.specialRequests || guestInfo.dietaryRestrictions) && (
              <div className="flex flex-col lg:justify-left lg:items-left lg:text-left">
                {guestInfo.dietaryRestrictions && (
                  <div>
                    <Label className="lg:text-md text-sm font-bold text-[#F38181]">
                      Restrictions alimentaires
                    </Label>
                    <p className="text-gray-800  p-2 pl-0 text-sm lg:text-base">
                      {guestInfo.dietaryRestrictions}
                    </p>
                  </div>
                )}
                {guestInfo.specialRequests && (
                  <div>
                    <Label className="lg:text-md text-sm font-bold text-[#F38181]">
                      Requêtes spéciales
                    </Label>
                    <p className="text-gray-800  p-2 pl-0 text-sm lg:text-base">
                      {guestInfo.specialRequests}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col justify-center items-center">
              <Label className="lg:text-md text-sm font-bold text-[#F38181]">
                Groupe
              </Label>{' '}
              <div>
                <div className="flex flex-row items-center space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setRSVPData((prev) => ({
                        ...prev,
                        confirmedPartySize: Math.max(
                          0,
                          prev.confirmedPartySize - 1,
                        ),
                      }))
                    }
                    disabled={rsvpData.confirmedPartySize <= 0}
                  >
                    -
                  </Button>
                  <div className="flex items-center ">
                    <Users className="w-5 h-5 text-[#F38181]" />
                    <span className="text-2xl font-bold text-gray-800 pl-2 text-center">
                      {rsvpData.confirmedPartySize}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setRSVPData((prev) => ({
                        ...prev,
                        confirmedPartySize: Math.min(
                          guestInfo.partySize,
                          prev.confirmedPartySize + 1,
                        ),
                      }))
                    }
                    disabled={
                      rsvpData.confirmedPartySize >= guestInfo.partySize
                    }
                  >
                    +
                  </Button>
                </div>
                <p className="text-sm text-gray-600">
                  Maximum: {guestInfo.partySize}{' '}
                  {guestInfo.partySize === 1 ? 'invité' : 'invités'}
                </p>
              </div>
            </div>
          </div>

          {/* Attendance Selection */}
          <div className="space-y-4">
            <Label className="text-base lg:text-lg font-medium text-gray-700 ">
              Serez-vous présent ?
            </Label>
            <div className="flex space-x-4 pt-4">
              <Button
                type="button"
                variant={rsvpData.isAttending ? 'default' : 'outline'}
                onClick={() =>
                  setRSVPData((prev) => ({ ...prev, isAttending: true }))
                }
                className={`flex-1 py-3 ${rsvpData.isAttending ? 'bg-[#4f8433] ' : ''}`}
              >
                Oui
              </Button>
              <Button
                type="button"
                variant={!rsvpData.isAttending ? 'default' : 'outline'}
                onClick={() =>
                  setRSVPData((prev) => ({
                    ...prev,
                    isAttending: false,
                    confirmedPartySize: 0,
                  }))
                }
                className={`flex-1 py-3 ${!rsvpData.isAttending ? 'bg-[#b74c50] ' : ''}`}
              >
                Non
              </Button>
            </div>
          </div>

          {/* Message/Notes */}
          <div className="space-y-3">
            <Label
              htmlFor="message"
              className="text-lg font-medium text-gray-700 flex items-center"
            >
              <MessageSquare className="w-5 h-5 mr-2 text-[#F38181]" />
              Message (Optionnel)
            </Label>
            <textarea
              id="message"
              value={rsvpData.message}
              onChange={(e) =>
                setRSVPData((prev) => ({ ...prev, message: e.target.value }))
              }
              placeholder={
                rsvpData.isAttending
                  ? 'Toute note ou requête spéciale?'
                  : "Vous nous manquerez! Faites-nous savoir si vous changez d'avis."
              }
              className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-[#F38181] focus:border-transparent resize-none"
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {message && (
            <div
              className={`p-4  ${
                message.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              <p className="font-medium">{message.text}</p>
            </div>
          )}

          <div className="flex space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep('hash-entry')}
              disabled={isSubmitting}
              className="flex-1"
            >
              Retour
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#4f8433] text-white px-6 sm:px-8 py-3  font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              {isSubmitting ? 'Soumission...' : 'Confirmer'}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // Fallback (should not reach here)
  return null;
}

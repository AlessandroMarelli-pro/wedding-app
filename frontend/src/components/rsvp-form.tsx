import { IconMoodSmileBeam } from '@tabler/icons-react';
import {
  CheckCircle,
  MessageSquare,
  MousePointerClick,
  Users,
  Utensils,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button-pers';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
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
      <div className={` rounded-2xl p-8  ${className}`}>
        <div className="text-center">
          <h3 className="text-2xl  text-gray-800 mb-4 flex items-center justify-center">
            Votre venue est confirmée <IconMoodSmileBeam className="w-8 h-8" />
          </h3>
          <p className="text-lg text-gray-700 mb-6">
            Merci{' '}
            <span className="font-medium text-rose-700">{confirmedGuest}</span>{' '}
            {rsvpData.confirmedPartySize === 1 ? '' : 'et vous tous'} !
          </p>
          {message && (
            <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg mb-6">
              <p className="text-sm">{message.text}</p>
            </div>
          )}
          <p className="text-gray-600 mb-8">
            Nous sommes si heureux de fêter ça avec vous ! Vous recevrez plus de
            détails proche de la date.
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
        <div className="text-center mb-6">
          <h2 className="text-2xl  text-gray-800 mb-2">RSVP</h2>
          <p className="text-gray-600">Veuillez confirmer votre présence</p>
        </div>

        <form onSubmit={handleHashSubmit} className="space-y-6 ">
          <div>
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
              placeholder="Entrez votre code à 8 caractères"
              className="text-lg text-center tracking-widest font-mono mt-2"
              maxLength={8}
              disabled={isSubmitting}
            />
            <p className="mt-2 text-sm text-gray-600 text-center">
              Ce code figure sur votre invitation
            </p>
          </div>

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
            type="submit"
            disabled={isSubmitting || hashCode.length !== 8}
            className="bg-black text-white px-6 sm:px-8 py-3  font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            {isSubmitting ? 'Vérification...' : 'Continuer'}{' '}
            <MousePointerClick className="h-4 w-4" />
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-rose-100">
          <p className="text-sm text-gray-600 text-center">
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
      <div className={` p-8  ${className}`}>
        <div className="text-center mb-6">
          <h2 className="text-2xl  text-gray-800 mb-2">
            Welcome, {guestInfo.firstName}!
          </h2>
          <p className="text-gray-600">
            Veuillez confirmer les détails de votre présence
          </p>
        </div>

        <form onSubmit={handleRSVPSubmit} className="space-y-6">
          {/* Guest Information Display */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Users className="w-5 h-5 mr-2 text-rose-500" />
                  Détails de l'invitation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <div className="flex flex-col justify-start items-start">
                    <Label className="text-sm font-medium text-gray-600">
                      Nom:
                    </Label>
                    <p className="text-gray-800 bg-gray-50  rounded">
                      {guestInfo.firstName} {guestInfo.lastName}
                    </p>
                  </div>
                  {guestInfo.email && (
                    <div className="flex justify-start items-start">
                      <div className="flex flex-col justify-start items-start">
                        <Label className="text-sm font-medium text-gray-600">
                          Email:
                        </Label>
                        <p className="text-gray-800 bg-gray-50  rounded">
                          {guestInfo.email}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col justify-start items-start">
                    <div className="flex flex-col justify-start items-start">
                      <Label className="text-sm font-medium text-gray-600">
                        Taille du groupe:
                      </Label>
                      <p className="text-gray-800 bg-gray-50  rounded ">
                        {guestInfo.partySize}{' '}
                        {guestInfo.partySize === 1 ? 'invité' : 'invités'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {(guestInfo.dietaryRestrictions || guestInfo.specialRequests) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Utensils className="w-5 h-5 mr-2 text-rose-500" />
                    Vos informations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-row justify-between items-start">
                    {guestInfo.dietaryRestrictions && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">
                          Restrictions alimentaires:
                        </Label>
                        <p className="text-gray-800 bg-gray-50 p-2 rounded">
                          {guestInfo.dietaryRestrictions}
                        </p>
                      </div>
                    )}{' '}
                    {guestInfo.specialRequests && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">
                          Requêtes spéciales:
                        </Label>
                        <p className="text-gray-800 bg-gray-50 p-2 rounded">
                          {guestInfo.specialRequests}
                        </p>
                      </div>
                    )}{' '}
                    <div>
                      <div className="flex items-center space-x-4">
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
                        <div className="flex items-center space-x-2">
                          <Users className="w-5 h-5 text-rose-500" />
                          <span className="text-2xl font-bold text-gray-800 w-12 text-center">
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
                </CardContent>
              </Card>
            )}
          </div>

          {/* Attendance Selection */}
          <div className="space-y-4">
            <Label className="text-lg font-medium text-gray-700">
              Seriez-vous présent?
            </Label>
            <div className="flex space-x-4">
              <Button
                type="button"
                variant={rsvpData.isAttending ? 'default' : 'outline'}
                onClick={() =>
                  setRSVPData((prev) => ({ ...prev, isAttending: true }))
                }
                className={`flex-1 py-3 ${rsvpData.isAttending ? 'bg-green-600 hover:bg-green-700' : ''}`}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Oui, je serai là!
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
                className={`flex-1 py-3 ${!rsvpData.isAttending ? 'bg-red-600 hover:bg-red-700' : ''}`}
              >
                Désolé, je ne peux pas y aller
              </Button>
            </div>
          </div>

          {/* Message/Notes */}
          <div className="space-y-3">
            <Label
              htmlFor="message"
              className="text-lg font-medium text-gray-700 flex items-center"
            >
              <MessageSquare className="w-5 h-5 mr-2 text-rose-500" />
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
              rows={3}
              disabled={isSubmitting}
            />
          </div>

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
              className="flex-1 bg-black text-white px-6 sm:px-8 py-3  font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
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

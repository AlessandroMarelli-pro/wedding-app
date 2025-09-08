import { CheckCircle, MessageSquare, Users, Utensils } from 'lucide-react';
import { useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
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
      setMessage({ type: 'error', text: 'Please enter your invitation code.' });
      return;
    }

    if (hashCode.length !== 8) {
      setMessage({
        type: 'error',
        text: 'Invitation code must be exactly 8 characters.',
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
            text: 'This invitation has already been used to confirm attendance.',
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
            'Invalid invitation code. Please check and try again.',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Network error. Please check your connection and try again.',
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
          text: data.message || 'Failed to confirm RSVP. Please try again.',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Network error. Please check your connection and try again.',
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
        className={`bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-rose-100 ${className}`}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-serif text-gray-800 mb-4">
            RSVP Confirmed!
          </h3>
          <p className="text-lg text-gray-700 mb-6">
            Thank you,{' '}
            <span className="font-medium text-rose-700">{confirmedGuest}</span>!
          </p>
          {message && (
            <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg mb-6">
              <p className="text-sm">{message.text}</p>
            </div>
          )}
          <p className="text-gray-600 mb-8">
            We're so excited to celebrate with you. You'll receive more details
            closer to the date.
          </p>
          <Button
            onClick={resetForm}
            variant="outline"
            className="text-rose-600 hover:text-rose-700 border-rose-200 hover:border-rose-300"
          >
            RSVP for another guest
          </Button>
        </div>
      </div>
    );
  }

  // Step 1: Hash Code Entry
  if (currentStep === 'hash-entry') {
    return (
      <div
        className={`bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-rose-100 ${className}`}
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-serif text-gray-800 mb-2">RSVP</h2>
          <p className="text-gray-600">Please confirm your attendance</p>
        </div>

        <form onSubmit={handleHashSubmit} className="space-y-6">
          <div>
            <Label
              htmlFor="hashCode"
              className="text-lg font-medium text-gray-700"
            >
              Invitation Code
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
              placeholder="Enter your 8-character code"
              className="text-lg text-center tracking-widest font-mono mt-2"
              maxLength={8}
              disabled={isSubmitting}
            />
            <p className="mt-2 text-sm text-gray-600 text-center">
              Find this code on your invitation
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
            className="w-full bg-gradient-to-r from-rose-400 to-pink-400 text-white py-4 text-lg font-medium hover:from-rose-500 hover:to-pink-500"
          >
            {isSubmitting ? 'Checking...' : 'Continue'}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-rose-100">
          <p className="text-sm text-gray-600 text-center">
            Having trouble? Contact us at{' '}
            <a
              href="mailto:wedding@example.com"
              className="text-rose-600 hover:text-rose-700 font-medium"
            >
              wedding@example.com
            </a>
          </p>
        </div>
      </div>
    );
  }

  // Step 2: RSVP Details Form
  if (currentStep === 'rsvp-details' && guestInfo) {
    return (
      <div
        className={`bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-rose-100 ${className}`}
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-serif text-gray-800 mb-2">
            Welcome, {guestInfo.firstName}!
          </h2>
          <p className="text-gray-600">
            Please confirm your attendance details
          </p>
        </div>

        <form onSubmit={handleRSVPSubmit} className="space-y-6">
          {/* Guest Information Display */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Users className="w-5 h-5 mr-2 text-rose-500" />
                Invitation Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">
                  {guestInfo.firstName} {guestInfo.lastName}
                </span>
              </div>
              {guestInfo.email && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{guestInfo.email}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Party Size:</span>
                <Badge variant="secondary">
                  {guestInfo.partySize}{' '}
                  {guestInfo.partySize === 1 ? 'guest' : 'guests'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Selection */}
          <div className="space-y-4">
            <Label className="text-lg font-medium text-gray-700">
              Will you be attending?
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
                Yes, I'll be there!
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
                Sorry, can't make it
              </Button>
            </div>
          </div>

          {/* Party Size Selection (only if attending) */}
          {rsvpData.isAttending && (
            <div className="space-y-3">
              <Label className="text-lg font-medium text-gray-700">
                How many people will attend?
              </Label>
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
                  disabled={rsvpData.confirmedPartySize >= guestInfo.partySize}
                >
                  +
                </Button>
              </div>
              <p className="text-sm text-gray-600">
                Maximum: {guestInfo.partySize}{' '}
                {guestInfo.partySize === 1 ? 'guest' : 'guests'}
              </p>
            </div>
          )}

          {/* Pre-filled dietary restrictions and special requests */}
          {rsvpData.isAttending &&
            (guestInfo.dietaryRestrictions || guestInfo.specialRequests) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Utensils className="w-5 h-5 mr-2 text-rose-500" />
                    Your Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {guestInfo.dietaryRestrictions && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Dietary Restrictions:
                      </Label>
                      <p className="text-gray-800 bg-gray-50 p-2 rounded">
                        {guestInfo.dietaryRestrictions}
                      </p>
                    </div>
                  )}
                  {guestInfo.specialRequests && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Special Requests:
                      </Label>
                      <p className="text-gray-800 bg-gray-50 p-2 rounded">
                        {guestInfo.specialRequests}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

          {/* Message/Notes */}
          <div className="space-y-3">
            <Label
              htmlFor="message"
              className="text-lg font-medium text-gray-700 flex items-center"
            >
              <MessageSquare className="w-5 h-5 mr-2 text-rose-500" />
              Message (Optional)
            </Label>
            <textarea
              id="message"
              value={rsvpData.message}
              onChange={(e) =>
                setRSVPData((prev) => ({ ...prev, message: e.target.value }))
              }
              placeholder={
                rsvpData.isAttending
                  ? 'Any special notes or requests?'
                  : "We'll miss you! Let us know if anything changes."
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
              Back
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-rose-400 to-pink-400 text-white hover:from-rose-500 hover:to-pink-500"
            >
              {isSubmitting ? 'Submitting...' : 'Confirm RSVP'}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // Fallback (should not reach here)
  return null;
}

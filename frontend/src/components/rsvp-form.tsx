import { useState } from 'react';

interface RSVPFormProps {
  className?: string;
}

export function RSVPForm({ className = '' }: RSVPFormProps) {
  const [hashCode, setHashCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [confirmedGuest, setConfirmedGuest] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
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
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/rsvp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ hashCode: hashCode.toUpperCase() }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        setConfirmedGuest(data.guestName);
        setMessage({ type: 'success', text: data.message });
        setHashCode('');
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

  if (confirmedGuest) {
    return (
      <div
        className={`bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-rose-100 ${className}`}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-serif text-gray-800 mb-4">
            RSVP Confirmed!
          </h3>
          <p className="text-lg text-gray-700 mb-6">
            Thank you,{' '}
            <span className="font-medium text-rose-700">{confirmedGuest}</span>!
          </p>
          <p className="text-gray-600 mb-8">
            We're so excited to celebrate with you. You'll receive more details
            closer to the date.
          </p>
          <button
            onClick={() => {
              setConfirmedGuest(null);
              setMessage(null);
            }}
            className="text-rose-600 hover:text-rose-700 font-medium"
          >
            RSVP for another guest
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-rose-100 ${className}`}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="hashCode"
            className="block text-lg font-medium text-gray-700 mb-3"
          >
            Invitation Code
          </label>
          <input
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
            className="w-full px-4 py-3 border border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent text-lg text-center tracking-widest font-mono bg-white/80"
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
            <div className="flex items-center">
              {message.type === 'success' ? (
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
              <p className="font-medium">{message.text}</p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || hashCode.length !== 8}
          className="w-full bg-gradient-to-r from-rose-400 to-pink-400 text-white py-4 px-6 rounded-lg text-lg font-medium hover:from-rose-500 hover:to-pink-500 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl disabled:transform-none disabled:shadow-md"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Confirming...
            </div>
          ) : (
            'Confirm Attendance'
          )}
        </button>
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

import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import { AccommodationsList } from '../components/accommodations';
import { RSVPForm } from '../components/rsvp-form';
import { WeddingProgram } from '../components/wedding-program';
import { WeddingInfo } from '../types/api';

interface HomePageProps {
  weddingInfo: WeddingInfo | null;
  accommodations: any[];
}

export default function HomePage({
  weddingInfo,
  accommodations,
}: HomePageProps) {
  const [currentSection, setCurrentSection] = useState('home');

  if (!weddingInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="text-center">
          <h1 className="text-4xl font-serif text-gray-800 mb-4">
            Wedding Information Coming Soon
          </h1>
          <p className="text-gray-600">
            Please check back later for details about our special day.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{weddingInfo.coupleNames} - Wedding</title>
        <meta
          name="description"
          content={`Join us for the wedding celebration of ${weddingInfo.coupleNames}`}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50">
        {/* Navigation */}
        <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-rose-100">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex justify-center space-x-8">
              {[
                { id: 'home', label: 'Home' },
                { id: 'details', label: 'Details' },
                { id: 'accommodations', label: 'Accommodations' },
                { id: 'program', label: 'Program' },
                { id: 'rsvp', label: 'RSVP' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentSection(item.id)}
                  className={`px-4 py-2 rounded-full transition-all duration-300 ${
                    currentSection === item.id
                      ? 'bg-rose-100 text-rose-800 font-medium'
                      : 'text-gray-700 hover:text-rose-700 hover:bg-rose-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        {currentSection === 'home' && (
          <section className="min-h-screen flex items-center justify-center pt-20 px-4">
            <div className="text-center max-w-4xl mx-auto">
              {/* Decorative element */}
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent mx-auto mb-8"></div>

              <h1 className="text-6xl md:text-8xl font-serif text-gray-800 mb-6 leading-tight">
                {weddingInfo.coupleNames}
              </h1>

              <div className="w-32 h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent mx-auto mb-8"></div>

              <p className="text-xl md:text-2xl text-gray-600 mb-8 font-light">
                {new Date(weddingInfo.weddingDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>

              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-xl border border-rose-100">
                <p className="text-lg md:text-xl text-gray-700 leading-relaxed font-light">
                  {weddingInfo.presentationMessage}
                </p>
              </div>

              <button
                onClick={() => setCurrentSection('rsvp')}
                className="mt-12 bg-gradient-to-r from-rose-400 to-pink-400 text-white px-12 py-4 rounded-full text-lg font-medium hover:from-rose-500 hover:to-pink-500 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                RSVP Now
              </button>
            </div>
          </section>
        )}

        {/* Wedding Details Section */}
        {currentSection === 'details' && (
          <section className="min-h-screen pt-24 px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-serif text-gray-800 mb-4">
                  Wedding Details
                </h2>
                <div className="w-24 h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent mx-auto"></div>
              </div>

              <div className="grid md:grid-cols-2 gap-12">
                {/* Date & Time */}
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-rose-100">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-6">
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
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-serif text-gray-800 mb-4">
                      When
                    </h3>
                    <p className="text-lg text-gray-700 mb-2">
                      {new Date(weddingInfo.weddingDate).toLocaleDateString(
                        'en-US',
                        {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        },
                      )}
                    </p>
                    <p className="text-gray-600">
                      {new Date(weddingInfo.weddingDate).toLocaleTimeString(
                        'en-US',
                        {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        },
                      )}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-rose-100">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-6">
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
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-serif text-gray-800 mb-4">
                      Where
                    </h3>
                    <p className="text-lg text-gray-700 mb-4">
                      {weddingInfo.weddingAddress}
                    </p>
                  </div>
                </div>
              </div>

              {/* Directions */}
              {weddingInfo.locationDirections && (
                <div className="mt-12 bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-rose-100">
                  <h3 className="text-2xl font-serif text-gray-800 mb-6 text-center">
                    Getting There
                  </h3>
                  <div className="prose prose-lg max-w-none text-gray-700">
                    <p className="whitespace-pre-line">
                      {weddingInfo.locationDirections}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Accommodations Section */}
        {currentSection === 'accommodations' && (
          <section className="min-h-screen pt-24 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-serif text-gray-800 mb-4">
                  Accommodations
                </h2>
                <div className="w-24 h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent mx-auto mb-6"></div>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  We've selected some wonderful places for you to stay during
                  our celebration.
                </p>
              </div>
              <AccommodationsList accommodations={accommodations} />
            </div>
          </section>
        )}

        {/* Program Section */}
        {currentSection === 'program' && (
          <section className="min-h-screen pt-24 px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-serif text-gray-800 mb-4">
                  Wedding Program
                </h2>
                <div className="w-24 h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent mx-auto mb-6"></div>
                <p className="text-xl text-gray-600">
                  Here's how our special day will unfold.
                </p>
              </div>
              <WeddingProgram />
            </div>
          </section>
        )}

        {/* RSVP Section */}
        {currentSection === 'rsvp' && (
          <section className="min-h-screen pt-24 px-4">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-serif text-gray-800 mb-4">
                  RSVP
                </h2>
                <div className="w-24 h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent mx-auto mb-6"></div>
                <p className="text-xl text-gray-600">
                  We can't wait to celebrate with you! Please confirm your
                  attendance.
                </p>
              </div>
              <RSVPForm />
            </div>
          </section>
        )}
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    // Fetch wedding information
    const weddingResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/wedding`,
    );
    const weddingInfo = weddingResponse.ok
      ? await weddingResponse.json()
      : null;

    // Fetch accommodations
    const accommodationsResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/accommodations`,
    );
    const accommodations = accommodationsResponse.ok
      ? await accommodationsResponse.json()
      : [];

    return {
      props: {
        weddingInfo,
        accommodations,
      },
    };
  } catch (error) {
    console.error('Error fetching wedding data:', error);
    return {
      props: {
        weddingInfo: null,
        accommodations: [],
      },
    };
  }
};

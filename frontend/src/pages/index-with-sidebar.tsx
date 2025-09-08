import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import {
  AccommodationsList,
  RSVPForm,
  Section,
  SectionHeader,
  VenueMap,
  WeddingCountdown,
  WeddingPresentation,
  WeddingProgram,
} from '../components';
import { SidebarLayout } from '../components/sidebar-layout';
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
      <>
        <Head>
          <title>Wedding Information Coming Soon</title>
          <meta
            name="description"
            content="Please check back later for details about our special day"
          />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <SidebarLayout
          type="public"
          currentSection={currentSection}
          onSectionChange={setCurrentSection}
        >
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
              <h1 className="text-4xl font-serif text-foreground mb-4">
                Wedding Information Coming Soon
              </h1>
              <p className="text-muted-foreground">
                Please check back later for details about our special day.
              </p>
            </div>
          </div>
        </SidebarLayout>
      </>
    );
  }

  const scrollToSection = (sectionId: string) => {
    setCurrentSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Helper function to get hero image URL
  const getHeroImageUrl = (): string => {
    if (weddingInfo.heroImageId) {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      return `${baseUrl}/images/${weddingInfo.heroImageId}`;
    }
    return '/images/hero-wedding.jpg'; // Fallback to default image
  };

  return (
    <>
      <Head>
        <title>{`${weddingInfo.coupleNames} - Wedding`}</title>
        <meta
          name="description"
          content={`Join us for the wedding celebration of ${weddingInfo.coupleNames}`}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <SidebarLayout
        type="public"
        currentSection={currentSection}
        onSectionChange={scrollToSection}
      >
        <div className="min-h-screen bg-background">
          {/* Hero Section */}
          <div className="relative h-screen w-full overflow-hidden">
            {/* Hero Image - Fixed Background */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-fixed"
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('${getHeroImageUrl()}')`,
              }}
            />

            {/* Hero Content Overlay */}
            <div className="relative z-10 flex items-center justify-center h-full px-4">
              <div className="text-center text-white max-w-4xl mx-auto">
                <div className="w-24 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent mx-auto mb-8" />

                <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif mb-6 leading-tight">
                  Ariane & Timothe
                </h1>

                <div className="w-32 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent mx-auto mb-8" />

                <p className="text-xl md:text-2xl mb-12 font-light opacity-90">
                  Together forever starts here
                </p>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                  <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center">
                    <svg
                      className="w-4 h-4 text-white/70 mt-2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 5v14m0 0l-5-5m5 5l5-5"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Our Story Section */}
          <Section id="our-story" background="accent" className="pt-20">
            <SectionHeader
              title="Our Story"
              subtitle="How our love story began and brought us to this beautiful moment"
            />
            <WeddingPresentation
              weddingInfo={weddingInfo}
              onRSVPClick={() => scrollToSection('rsvp')}
            />
          </Section>

          {/* Wedding Details Section */}
          <Section id="details" background="default">
            <SectionHeader
              title="Wedding Details"
              subtitle="All the important information about our special day"
            />

            {/* Countdown */}
            <div className="mb-16">
              <WeddingCountdown targetDate={weddingInfo.weddingDate} />
            </div>

            {/* Additional Details Card */}
            <div className="container-responsive">
              <div className="bg-card/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg border text-center">
                <h3 className="heading-responsive font-serif text-foreground mb-6">
                  Join Us in Celebration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 text-left">
                  <div>
                    <h4 className="font-semibold text-responsive text-foreground mb-2">
                      Date & Time
                    </h4>
                    <p className="text-responsive text-muted-foreground">
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
                  </div>
                  <div>
                    <h4 className="font-semibold text-responsive text-foreground mb-2">
                      Location
                    </h4>
                    <p className="text-responsive text-muted-foreground">
                      {weddingInfo.weddingAddress}
                    </p>
                  </div>
                </div>

                {weddingInfo.locationDirections && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-semibold text-responsive text-foreground mb-2">
                      Getting There
                    </h4>
                    <p className="text-responsive text-muted-foreground whitespace-pre-line">
                      {weddingInfo.locationDirections}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Venue Map */}
            <div className="mt-8 sm:mt-12">
              <div className="text-center mb-6 sm:mb-8">
                <h3 className="heading-responsive font-serif text-foreground mb-2">
                  Wedding Venue Location
                </h3>
                <p className="text-responsive text-muted-foreground">
                  Find the wedding venue and get directions
                </p>
              </div>
              <VenueMap
                weddingInfo={{
                  weddingAddress: weddingInfo.weddingAddress,
                  weddingDate: weddingInfo.weddingDate,
                  coupleNames: weddingInfo.coupleNames,
                  locationDirections: weddingInfo.locationDirections,
                  latitude: undefined,
                  longitude: undefined,
                }}
                height="300px"
                showDirections={true}
                showDetails={true}
              />
            </div>
          </Section>

          {/* Accommodations Section */}
          <Section id="accommodations" background="muted">
            <SectionHeader
              title="Where to Stay"
              subtitle="We've selected some wonderful places for you to stay during our celebration"
            />
            <AccommodationsList
              accommodations={accommodations}
              weddingLocation={
                weddingInfo
                  ? {
                      address: weddingInfo.weddingAddress,
                      latitude: undefined,
                      longitude: undefined,
                    }
                  : undefined
              }
            />
          </Section>

          {/* Wedding Program Section */}
          <Section id="program" background="default">
            <SectionHeader
              title="Wedding Schedule"
              subtitle="Here's how our special day will unfold"
            />
            <WeddingProgram />
          </Section>

          {/* RSVP Section */}
          <Section id="rsvp" background="accent">
            <SectionHeader
              title="RSVP"
              subtitle="We can't wait to celebrate with you! Please confirm your attendance"
            />
            <div className="container-responsive max-w-2xl mx-auto">
              <RSVPForm />
            </div>
          </Section>
        </div>
      </SidebarLayout>
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

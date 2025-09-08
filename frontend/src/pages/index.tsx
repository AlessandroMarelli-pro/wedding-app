import { GetServerSideProps } from 'next';
import { useState } from 'react';
import {
  AccommodationsList,
  Layout,
  Navigation,
  RSVPForm,
  Section,
  SectionHeader,
  VenueMap,
  WeddingCountdown,
  WeddingPresentation,
  WeddingProgram,
} from '../components';
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
      <Layout
        title="Wedding Information Coming Soon"
        description="Please check back later for details about our special day"
        showHeroImage={false}
      >
        <Section className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-serif text-foreground mb-4">
              Wedding Information Coming Soon
            </h1>
            <p className="text-muted-foreground">
              Please check back later for details about our special day.
            </p>
          </div>
        </Section>
      </Layout>
    );
  }

  const sections = [
    { id: 'home', label: 'Home' },
    { id: 'our-story', label: 'Our Story' },
    { id: 'details', label: 'Details' },
    { id: 'accommodations', label: 'Stay' },
    { id: 'program', label: 'Schedule' },
    { id: 'rsvp', label: 'RSVP' },
  ];

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
    <Layout
      title={`${weddingInfo.coupleNames} - Wedding`}
      description={`Join us for the wedding celebration of ${weddingInfo.coupleNames}`}
      heroImage={getHeroImageUrl()}
    >
      {/* Fixed Navigation */}
      <Navigation
        currentSection={currentSection}
        onSectionChange={scrollToSection}
        sections={sections}
      />

      {/* Our Story Section */}
      <Section id="our-story" background="accent" className="pt-32">
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
              latitude: undefined, // We'll need to add this to the wedding info entity
              longitude: undefined, // We'll need to add this to the wedding info entity
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
                  latitude: undefined, // We'll need to add this to the wedding info entity
                  longitude: undefined, // We'll need to add this to the wedding info entity
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
    </Layout>
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

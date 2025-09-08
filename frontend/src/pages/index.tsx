import { HoverBorderGradient } from '@/components/ui/hover-border-gradient';
import { Vortex } from '@/components/ui/vortex';
import { cn } from '@/lib/utils';
import { IconArrowDown } from '@tabler/icons-react';
import { GetServerSideProps } from 'next';
import { Pacifico } from 'next/font/google';
import Head from 'next/head';
import { useState } from 'react';
import {
  AccommodationsList,
  FloatingNavbarLayout,
  RSVPForm,
  Section,
  SectionHeader,
  WeddingCountdown,
  WeddingPresentation,
  WeddingProgram,
} from '../components';
import { WeddingInfo } from '../types/api';
const pacifico = Pacifico({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-pacifico',
});

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
        <FloatingNavbarLayout
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
        </FloatingNavbarLayout>
      </>
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

      <FloatingNavbarLayout
        type="public"
        currentSection={currentSection}
        onSectionChange={scrollToSection}
      >
        <div className="min-h-screen ">
          {/* Hero Section */}
          <div className="relative h-screen w-full overflow-hidden bg-black">
            {/* Hero Content Overlay */}
            <Section id="home">
              <Vortex
                backgroundColor="red"
                rangeY={800}
                baseHue={120}
                particleCount={50}
                className="flex items-center flex-col justify-center px-2 md:px-10  w-full h-screen"
              >
                <div className="relative z-10 flex items-center justify-center h-full w-full px-4 color-black">
                  <div className="text-center text-white max-w-4xl mx-auto color-black ">
                    <h1
                      className={cn(
                        'text-5xl md:text-7xl lg:text-8xl font-serif mb-6 leading-tight color-black',
                        pacifico.className,
                      )}
                    >
                      Ariane & Timothé
                    </h1>
                    <div className="w-32 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent mx-auto mb-8" />
                    <p className="text-xl md:text-2xl mb-2 font-light opacity-90">
                      Nous avons hâte de vous accueillir aux Lauziers pour
                      célébrer notre mariage le
                    </p>{' '}
                    <p className="text-xl md:text-2xl mb-12 font-light opacity-90">
                      13 Juillet 2026
                    </p>
                    <div className="mb-16">
                      <WeddingCountdown targetDate={weddingInfo.weddingDate} />
                    </div>
                    {/* Scroll indicator */}
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                      <HoverBorderGradient
                        containerClassName="rounded-full"
                        as="button"
                        className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2 cursor-pointer"
                        onClick={() => scrollToSection('our-story')}
                      >
                        <IconArrowDown />
                        <span>Détails</span>
                      </HoverBorderGradient>
                    </div>
                  </div>
                </div>
              </Vortex>
            </Section>
          </div>

          {/* Our Story Section */}
          <Section id="our-story" background="default" className="pt-20">
            <SectionHeader title="Un petit mot" subtitle="" />
            <WeddingPresentation
              weddingInfo={weddingInfo}
              onRSVPClick={() => scrollToSection('rsvp')}
            />
          </Section>

          {/* Wedding Details Section */}
          <Section id="details" background="default">
            <SectionHeader
              title="Informations"
              subtitle="Toutes les informations importantes sur notre mariage"
            />

            {/* Additional Details Card */}
            <div className="container-responsive">
              <div className="bg-card/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg border text-center">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 text-left">
                  <div>
                    <h4 className="font-semibold text-responsive text-foreground mb-2">
                      Date
                    </h4>
                    <p className="text-responsive text-muted-foreground">
                      {new Date(weddingInfo.weddingDate).toLocaleDateString(
                        'fr-FR',
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
                      Lieu
                    </h4>
                    <p className="text-responsive text-muted-foreground">
                      {weddingInfo.weddingAddress}
                    </p>
                  </div>
                </div>

                {weddingInfo.locationDirections && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-semibold text-responsive text-foreground mb-2">
                      Comment venir ?
                    </h4>
                    <p className="text-responsive text-muted-foreground whitespace-pre-line">
                      {weddingInfo.locationDirections}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Venue Map */}
            {/*  <div className="mt-8 sm:mt-12">
              <div className="text-center mb-6 sm:mb-8">
                <h3 className="heading-responsive font-serif text-foreground mb-2">
                  Lieu du mariage
                </h3>
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
                showDetails={false}
              />
            </div> */}
          </Section>

          {/* Accommodations Section */}
          <Section id="accommodations" background="muted">
            <SectionHeader
              title="Où dormir ?"
              subtitle="Nous avons sélectionné quelques endroits pour vous pour votre séjour"
            />

            <AccommodationsList
              accommodations={accommodations}
              weddingInfo={{
                weddingAddress: weddingInfo.weddingAddress,
                weddingDate: weddingInfo.weddingDate,
                coupleNames: weddingInfo.coupleNames,
                locationDirections: weddingInfo.locationDirections,
                latitude: undefined, // We'll need to add this to the wedding info entity
                longitude: undefined, // We'll need to add this to the wedding info entity
              }}
            />
          </Section>

          {/* Wedding Program Section */}
          <Section id="program" background="default">
            <SectionHeader
              title="Programme"
              subtitle="Voici comment notre jour se déroulera"
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
      </FloatingNavbarLayout>
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

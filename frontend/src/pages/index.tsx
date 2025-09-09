import { Button } from '@/components/ui';
import { Vortex } from '@/components/ui/vortex';
import { cn } from '@/lib/utils';
import { IconArrowDown } from '@tabler/icons-react';
import { GetServerSideProps } from 'next';
import { Parisienne } from 'next/font/google';
import Head from 'next/head';
import { useState } from 'react';
import {
  AccommodationMap,
  AccommodationsList,
  NavbarLayout,
  RSVPForm,
  Section,
  SectionHeader,
  WeddingCountdown,
  WeddingPresentation,
  WeddingProgram,
} from '../components';
import { WeddingInfo } from '../types/api';
const bilbo = Parisienne({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-bilbo',
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
        <NavbarLayout
          type="public"
          currentSection={currentSection}
          onSectionChange={setCurrentSection}
        >
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
              <h1 className="text-4xl  text-foreground mb-4">
                Wedding Information Coming Soon
              </h1>
              <p className="text-muted-foreground">
                Please check back later for details about our special day.
              </p>
            </div>
          </div>
        </NavbarLayout>
      </>
    );
  }

  const sections = [
    { id: 'home', label: 'Home' },
    { id: 'our-story', label: 'Un petit mot' },
    { id: 'details', label: 'Informations' },
    { id: 'accommodations', label: 'Où dormir ?' },
    { id: 'program', label: 'Programme' },
    { id: 'rsvp', label: 'Réponse' },
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

      <NavbarLayout
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
                backgroundColor="black"
                rangeY={800}
                baseHue={120}
                particleCount={50}
                className="flex items-center flex-col justify-center px-2 md:px-10  w-full h-screen"
              >
                <div className="relative z-10 flex items-center justify-center h-full w-full px-4 color-black">
                  <div className="text-center text-white max-w-4xl mx-auto color-black ">
                    <h1
                      className={cn(
                        'text-5xl md:text-7xl lg:text-8xl  mb-6 leading-tight color-black',
                        bilbo.className,
                      )}
                    >
                      Ariane & Timothé
                    </h1>
                    <div className="w-32 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent mx-auto mb-8" />
                    <p className="text-md md:text-md mb-2 font-light opacity-90">
                      Nous avons hâte de vous accueillir aux Lauziers pour
                      célébrer notre mariage le
                    </p>{' '}
                    <p className="text-md md:text-md mb-2 font-light opacity-90">
                      13 Juillet 2026
                    </p>
                    <div className="mb-16">
                      <WeddingCountdown targetDate={weddingInfo.weddingDate} />
                    </div>
                    {/* Scroll indicator */}
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                      <Button
                        className="bg-transparent text-white flex items-center space-x-2 cursor-pointer"
                        onClick={() => scrollToSection('our-story')}
                      >
                        <IconArrowDown />
                        <span>Détails</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </Vortex>
            </Section>
          </div>

          {/* Our Story Section */}
          <Section id="our-story" background="default">
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
            <div className=" ">
              <div className=" rounded-xl sm:rounded-2xl p-6 sm:p- text-center grid grid-cols-4 gap-6 sm:gap-8  ">
                <div className=" gap-6 sm:gap-8 text-left flex flex-col space-between col-span-2 flex justify-evenly">
                  <h4 className="font-semibold text-responsive text-foreground mb-4"></h4>
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
                  <AccommodationMap
                    accommodations={[]}
                    weddingInfo={weddingInfo}
                    height="300px"
                    showDirections={false}
                    showDetails={false}
                    className="mb-6 sm:mb-8"
                  />
                </div>

                {weddingInfo.locationDirections &&
                  weddingInfo.locationDirections.length > 0 && (
                    <div className=" col-span-2 ">
                      <h4 className="font-semibold text-responsive text-foreground mb-4 ">
                        Comment venir ?
                      </h4>
                      <div className="space-y-4 flex flex-col space-between ">
                        {weddingInfo.locationDirections.map(
                          (direction, index) => (
                            <div
                              key={index}
                              className="relative flex flex-col my-6 bg-white shadow-sm border border-slate-200 rounded-lg  p-3"
                            >
                              <div className="flex items-center mb-1">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke-width="1.5"
                                  stroke="currentColor"
                                  className="h-6 w-6 text-slate-600"
                                >
                                  <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
                                  />
                                </svg>
                                <h5 className="font-medium text-foreground capitalize">
                                  {direction.type === 'car'
                                    ? 'En voiture'
                                    : direction.type === 'train'
                                      ? 'En train'
                                      : 'Location de voiture'}
                                </h5>
                              </div>
                              <p className="block text-slate-600 leading-normal font-light mb-1 text-sm text-left">
                                {direction.information}
                              </p>
                              <div className="text-left">
                                <span className="text-xs text-muted-foreground ">
                                  📍
                                </span>
                                {direction.location.link ? (
                                  <a
                                    href={direction.location.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline text-xs"
                                  >
                                    {direction.location.address}
                                  </a>
                                ) : (
                                  <span className="text-muted-foreground text-sm">
                                    {direction.location.address}
                                  </span>
                                )}
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>
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
          <Section
            id="program"
            background="default"
            className="h-screen max-h-screen "
          >
            <SectionHeader
              title="Programme"
              subtitle="Voici comment notre jour se déroulera"
            />
            <WeddingProgram />
          </Section>

          {/* RSVP Section */}
          <Section id="rsvp" background="accent" className="h-screen">
            <SectionHeader
              title="RSVP"
              subtitle="We can't wait to celebrate with you! Please confirm your attendance"
            />
            <div className="mx-auto">
              <RSVPForm />
            </div>
          </Section>
        </div>
      </NavbarLayout>
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

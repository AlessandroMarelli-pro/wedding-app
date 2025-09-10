import { Button } from '@/components/ui/button';
import { LinkPreview } from '@/components/ui/link-preview';
import { Vortex } from '@/components/ui/vortex';
import { cn } from '@/lib/utils';
import {
  IconArrowDown,
  IconCar,
  IconMapPinFilled,
  IconTrain,
} from '@tabler/icons-react';
import { GetServerSideProps } from 'next';
import { Parisienne } from 'next/font/google';
import Head from 'next/head';
import Image from 'next/image';
import { useState } from 'react';
import {
  AccommodationsList,
  NavbarLayout,
  RSVPFormModal,
  Section,
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
const WeddingHowToArriveIcons = {
  car: <IconCar className="w-10 h-10" />,
  train: <IconTrain className="w-10 h-10" />,
  'car rental': <IconCar className="w-10 h-10" />,
};

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

  const getDirectionName = (directionType: string) => {
    return directionType === 'car'
      ? 'En voiture'
      : directionType === 'train'
        ? 'En train'
        : 'Location de voiture';
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
        <div className="min-h-screen bg-white">
          {/* Hero Section */}
          <Section id="home">
            <Vortex
              backgroundColor="black"
              rangeY={800}
              baseHue={250}
              particleCount={250}
              className="flex items-center flex-col justify-center px-2 md:px-10  w-full h-screen"
            >
              <div className="relative grid grid-cols-6  items-center justify-center h-full w-full ">
                <p className="text-[#F38181] fraunces-regular col-span-1  text-2xl mb-2 font-light opacity-90 h-full w-full flex flex-col justify-end pb-10">
                  Nous avons le plaisir de vous inviter à notre mariage le 13
                  Juillet 2026
                </p>{' '}
                <div className=" z-10 col-span-4  h-full w-full flex flex-col justify-center ">
                  <div className="text-center text-white    flex flex-col items-center justify-center">
                    <h1
                      className={cn(
                        'text-5xl md:text-7xl lg:text-9xl  mb-6 leading-tight color-black',
                        bilbo.className,
                      )}
                    >
                      Ariane & Timothé
                    </h1>

                    {/*  <div className="mb-16">
                    <WeddingCountdown targetDate={weddingInfo.weddingDate} />
                  </div> */}
                    {/* Scroll indicator */}
                    <img
                      src="/images/couple.jpeg"
                      alt="Ariane and Timothé"
                      className="h-180 w-auto absolute   z-[-1] rounded-t-[90%]  -bottom-5"
                    />
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
                <p className=" text-[#F38181] fraunces-bold col-span-1 text-2xl mb-2 font-light opacity-90 h-full w-full flex flex-col justify-end pb-10">
                  Lauziers, Condillac
                </p>
              </div>
            </Vortex>
          </Section>
          {/* Our Story Section */}
          <Section id="our-story" background="default" className="h-auto">
            <WeddingPresentation weddingInfo={weddingInfo} />
          </Section>

          {/* Wedding Details Section */}
          <Section id="details" background="accent">
            {/* Additional Details Card */}
            <div className="space-y-4 ">
              <div className=" rounded-xl sm:rounded-2xl   text-center grid  grid-cols-2 grid-rows-2 gap-6 max-h-screen h-screen">
                <div className=" row-span-2">
                  <div className="row-span-1 justify-items-start flex flex-col">
                    <div className="text-center  flex flex-row items-center justify-around gap-10">
                      <Image
                        src={'/images/lauziers-aqua.webp'}
                        alt={weddingInfo.coupleNames}
                        width={600}
                        height={600}
                        className="object-cover w-full max-w-[50rem]"
                      />
                    </div>
                  </div>
                  <div className="row-span-1  flex flex-col h-[40%] justify-around">
                    <h1
                      className={cn(
                        'text-[#EAFFD0]  text-8xl my-4',
                        bilbo.className,
                      )}
                    >
                      Le lieu
                    </h1>
                    <div>
                      {weddingInfo.weddingAddress.split(',').map((chunk) => (
                        <p className="text-xl text-[#EAFFD0] fraunces-light">
                          {chunk}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
                {weddingInfo.locationDirections &&
                  weddingInfo.locationDirections.length > 0 && (
                    <div className="row-span-2 flex flex-col justify-around">
                      <div className="row-span-1 flex flex-col  ">
                        <div className="h-full ">
                          <h1
                            className={cn(
                              'py-5  text-8xl text-[#EAFFD0]',
                              bilbo.className,
                            )}
                          >
                            Comment venir ?
                          </h1>
                          {/*                           <AccommodationMap
                            accommodations={weddingInfo.locationDirections.map(
                              (direction, index) => ({
                                id: direction.type,
                                name: getDirectionName(direction.type),
                                address: direction.location.address,
                                description: direction.information,
                                isRecommended: true,
                                displayOrder: index,
                              }),
                            )}
                            weddingInfo={weddingInfo}
                            height="300px"
                            showDirections={false}
                            showDetails={false}
                            className="mb-6 sm:mb-4  w-full"
                          /> */}
                        </div>
                      </div>
                      <div className="row-span-1  flex flex-col  gap-4">
                        {weddingInfo.locationDirections.map(
                          (direction, index) => (
                            <div
                              key={index}
                              className="relative flex flex-col   items-center rounded-lg   p-3"
                            >
                              <div className="flex items-center mb-1 gap-2 text-[#EAFFD0]">
                                {WeddingHowToArriveIcons[direction.type]}
                                <h5 className="font-medium text-[#EAFFD0] capitalize text-3xl  ">
                                  {getDirectionName(direction.type)}
                                </h5>
                              </div>
                              <p className="block text-[#EAFFD0]  leading-normal  mb-1 text-md text-left">
                                {direction.information
                                  .split('.')
                                  .filter((line) => line.trim() !== '')
                                  .map((line, index) => (
                                    <span key={index}>
                                      {line + '.'}
                                      <br />
                                    </span>
                                  ))}
                              </p>
                              <div className="text-left flex flex-row items-center gap-2">
                                <span className="text-sm text-[#EAFFD0] ">
                                  <IconMapPinFilled className="w-4 h-4" />
                                </span>
                                <LinkPreview
                                  width={300}
                                  height={200}
                                  url={direction.location.link || ''}
                                  className="text-[#EAFFD0] hover:underline text-sm target:blank"
                                >
                                  {direction.location.address}
                                </LinkPreview>
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
          <Section id="accommodations" background="default">
            <div className="space-y-4 ">
              <div className=" rounded-xl sm:rounded-2xl   text-center grid  grid-cols-2 grid-rows-2  max-h-screen h-screen">
                <div className="row-span-2">
                  <div className="row-span-1 flex flex-col justify-around ">
                    <div className="h-full ">
                      <h1
                        className={cn(
                          'py-5  text-8xl text-[#F38181]',
                          bilbo.className,
                        )}
                      >
                        Ou dormir ?
                      </h1>
                    </div>
                  </div>
                  <div className="row-span-1 justify-items-start flex flex-col max-h-[50%]">
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
                  </div>
                </div>
                <div className=" row-span-2 flex flex-col justify-evenly">
                  <div className="row-span-1  flex flex-col ">
                    <div className="text-center  flex flex-row items-center justify-around ">
                      <Image
                        src={'/images/program/1.jpg'}
                        alt={weddingInfo.coupleNames}
                        width={600}
                        height={600}
                        className="object-cover w-full max-w-[50rem] "
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* Wedding Program Section */}
          <Section
            id="program"
            background="muted"
            className="h-[50vh] max-h-screen "
          >
            <WeddingProgram />
          </Section>
          <Section
            id="rsvp"
            background="accent"
            className="h-[50vh] max-h-screen "
          >
            <div className="w-full h-full flex flex-col justify-center items-center  gap-10">
              <p className="text-5xl  fraunces-regula text-[#EAFFD0]">
                Nous espérons vous voir en ce jour spécial !
              </p>
              <RSVPFormModal
                btnColor="bg-[#EAFFD0]"
                btnTextColor="text-[#F38181] fraunces-bold"
              />
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

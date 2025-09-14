import { WeddingAccomodations } from '@/components/wedding-accomodations';
import { WeddingHero } from '@/components/wedding-hero';
import { WeddingInformation } from '@/components/wedding-information';
import { cn } from '@/lib/utils';
import { GetServerSideProps } from 'next';
import { Parisienne } from 'next/font/google';
import Head from 'next/head';
import { useState } from 'react';
import {
  NavbarLayout,
  RSVPFormModal,
  Section,
  WeddingPresentation,
  WeddingProgram,
} from '../components';
import { Accommodation, UploadedImage, WeddingInfo } from '../types/api';

const bilbo = Parisienne({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-bilbo',
});

interface HomePageProps {
  weddingInfo: WeddingInfo | null;
  accommodations: any[];
  images: UploadedImage[];
}

const HeroSection = ({
  weddingInfo,
  heroImage,
  scrollToSection,
  maxCanvasHeight,
}: {
  weddingInfo: WeddingInfo;
  heroImage: UploadedImage;
  scrollToSection: (sectionId: string) => void;
  maxCanvasHeight: number;
}) => {
  return (
    <Section id="home">
      <WeddingHero
        weddingInfo={weddingInfo}
        heroImage={heroImage}
        scrollToSection={scrollToSection}
        font={bilbo}
        maxCanvasHeight={maxCanvasHeight}
      />
    </Section>
  );
};

const OurStorySection = ({ weddingInfo }: { weddingInfo: WeddingInfo }) => {
  return (
    <Section id="nous" background="default" className="h-auto">
      <WeddingPresentation weddingInfo={weddingInfo} />
    </Section>
  );
};

const WeddingDetailsSection = ({
  weddingInfo,
  infoImage,
  getDirectionName,
}: {
  weddingInfo: WeddingInfo;
  infoImage: UploadedImage;
  getDirectionName: (directionType: string) => string;
}) => {
  return (
    <Section id="informations" background="accent">
      <WeddingInformation
        infoImage={infoImage}
        weddingInfo={weddingInfo}
        getDirectionName={getDirectionName}
        font={bilbo}
      />
    </Section>
  );
};

const AccommodationsSection = ({
  accommodations,
  weddingInfo,
  accommodationsImage,
}: {
  accommodations: Accommodation[];
  weddingInfo: WeddingInfo;
  accommodationsImage: UploadedImage;
}) => {
  return (
    <Section id="logements" background="default">
      <WeddingAccomodations
        accommodationsImage={accommodationsImage}
        accommodations={accommodations}
        weddingInfo={weddingInfo}
        font={bilbo}
      />
    </Section>
  );
};

const WeddingProgramSection = () => {
  return (
    <Section
      id="programme"
      background="muted"
      className="lg:h-[50vh] xl:max-h-screen "
    >
      <WeddingProgram font={bilbo} />
    </Section>
  );
};

const RSVPSection = () => {
  return (
    <Section
      id="rsvp"
      background="accent"
      className="h-[30vh] lg:h-[50vh] max-h-screen "
    >
      <div className="w-full h-full flex flex-col text-center justify-center items-center  gap-10">
        <p className=" text-3xl lg:text-5xl   text-[#EAFFD0]">
          Nous espérons vous voir en ce jour spécial !
        </p>
        <RSVPFormModal
          btnColor="bg-[#EAFFD0]"
          btnTextColor="text-[#F38181] font-bold"
        />
      </div>
    </Section>
  );
};

const BonusSection = () => {
  return (
    <Section id="bonus" background="muted">
      <div className="w-full h-[50vh] flex flex-col text-center justify-center items-center  gap-5">
        <span className={cn(bilbo.className, 'text-2xl text-[#F38181]')}>
          En bonus, l'instant où la demande de mariage a été acceptée
        </span>
        <iframe
          className="w-[75%] h-[75%]"
          width="50%"
          height="50%"
          src="https://www.youtube.com/embed/Xud6KnnQJec?si=d2TUR0h-j21-a6CN"
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
        ></iframe>
      </div>
    </Section>
  );
};

const MissingDataSection = () => {
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
    </>
  );
};

export default function HomePage({
  weddingInfo,
  accommodations,
  images,
}: HomePageProps) {
  const [currentSection, setCurrentSection] = useState('home');

  if (!weddingInfo) {
    return <MissingDataSection />;
  }

  const scrollToSection = (sectionId: string) => {
    setCurrentSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getDirectionName = (directionType: string) => {
    return directionType === 'car'
      ? 'En voiture'
      : directionType === 'train'
        ? 'En train'
        : 'Location de voiture';
  };
  let maxCanvasHeight = 500;
  try {
    maxCanvasHeight = window?.screen?.height;
  } catch (error) {
    console.error('Error getting max canvas height:', error);
  }
  const heroImage = images.find((image) => image.usageLocation === 'hero');
  const accommodationsImage = images.find(
    (image) => image.usageLocation === 'accommodation',
  );
  const weddingDetailsImage = images.find(
    (image) => image.usageLocation === 'information',
  );

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
        currentSection={currentSection}
        onSectionChange={scrollToSection}
      >
        <div className="min-h-screen bg-white">
          <HeroSection
            heroImage={heroImage as UploadedImage}
            weddingInfo={weddingInfo}
            scrollToSection={scrollToSection}
            maxCanvasHeight={maxCanvasHeight}
          />
          <OurStorySection weddingInfo={weddingInfo} />
          <WeddingDetailsSection
            infoImage={weddingDetailsImage as UploadedImage}
            weddingInfo={weddingInfo}
            getDirectionName={getDirectionName}
          />{' '}
          <AccommodationsSection
            accommodations={accommodations}
            weddingInfo={weddingInfo}
            accommodationsImage={accommodationsImage as UploadedImage}
          />
          <WeddingProgramSection />
          <RSVPSection />
          <BonusSection />
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
    const accommodations = (
      accommodationsResponse.ok ? await accommodationsResponse.json() : []
    ) as Accommodation[];

    const imagesResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/images`,
    );
    const images = (
      imagesResponse.ok ? await imagesResponse.json() : []
    ) as UploadedImage[];

    return {
      props: {
        weddingInfo,
        accommodations,
        images,
      },
    };
  } catch (error) {
    console.error('Error fetching wedding data:', error);
    return {
      props: {
        weddingInfo: null,
        accommodations: [],
        images: [],
      },
    };
  }
};

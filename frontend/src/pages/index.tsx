import { WeddingAccomodations } from '@/components/wedding-accomodations';
import { WeddingHero } from '@/components/wedding-hero';
import { WeddingInformation } from '@/components/wedding-information';
import { cn } from '@/lib/utils';
import ApiService from '@/services/api';
import { IconHeartHandshake } from '@tabler/icons-react';
import { GetStaticProps } from 'next';
import { Parisienne } from 'next/font/google';
import Head from 'next/head';
import Image from 'next/image';
import { useEffect } from 'react';
import {
  NavbarLayout,
  Section,
  WeddingPresentation,
  WeddingProgram,
} from '../components';
import {
  Accommodation,
  ProgramEvent,
  UploadedImage,
  WeddingInfo,
} from '../types/api';

const bilbo = Parisienne({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-bilbo',
});

interface HomePageProps {
  weddingInfo: WeddingInfo | null;
  accommodations: any[];
  images: UploadedImage[];
  programs: ProgramEvent[];
}

const HeroSection = ({
  weddingInfo,
  heroImage,
  scrollToSection,
}: {
  weddingInfo: WeddingInfo;
  heroImage: UploadedImage;
  scrollToSection: (sectionId: string) => void;
}) => {
  return (
    <Section id="home">
      <WeddingHero
        weddingInfo={weddingInfo}
        heroImage={heroImage}
        scrollToSection={scrollToSection}
        font={bilbo}
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
    <Section id="logements" background="accent">
      <WeddingAccomodations
        accommodationsImage={accommodationsImage}
        accommodations={accommodations}
        weddingInfo={weddingInfo}
        font={bilbo}
      />
    </Section>
  );
};

const WeddingProgramSection = ({ programs }: { programs: ProgramEvent[] }) => {
  return (
    <Section
      id="programme"
      background="muted"
      className="lg:h-[50vh] xl:max-h-screen "
    >
      <WeddingProgram font={bilbo} events={programs} />
    </Section>
  );
};

const RSVPSection = () => {
  return (
    <Section id="rsvp" background="accent" className="h-[50vh] max-h-screen ">
      <div className="w-full h-full flex flex-col lg:text-center lg:justify-center lg:items-center justify-start items-start text-center gap-10">
        <video
          id="video"
          width="100%"
          height="100%"
          autoPlay
          muted
          loop
          className="lg:max-h-[50vh] h-[50vh] absolute z-0 object-cover object-bottom hidden lg:block"
          playsInline
        >
          <source src="/clips/clip.webm" type="video/webm" />
        </video>
        <Image
          priority
          src="/clips/clip_optimized.gif"
          alt="RSVP"
          width={1000}
          height={1000}
          className="lg:max-h-[50vh] h-[50vh] absolute z-0 object-cover object-bottom lg:hidden block"
        />
        <p className=" text-4xl lg:text-6xl   text-[#EAFFD0] z-1 pt-10 lg:pt-0 ">
          Nous espérons vous voir nombreux en ce jour spécial !
        </p>
      </div>
    </Section>
  );
};

const BonusSection = () => {
  return (
    <Section id="bonus" background="muted">
      <div className="w-full h-[50vh] flex flex-col text-center justify-center items-center  gap-5">
        <span
          className={cn(
            bilbo.className,
            'text-2xl text-[#F38181] flex lg:flex-row flex-col items-center gap-2 pt-5',
          )}
        >
          En bonus, l'instant où la demande de mariage a été faite{' '}
          <IconHeartHandshake />
        </span>
        <iframe
          className="w-[75%] h-[75%] pb-5"
          width="30%"
          height="50%"
          src="https://www.youtube.com/embed/Xud6KnnQJec?si=d2TUR0h-j21-a6CN"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        ></iframe>
      </div>
    </Section>
  );
};

const MissingDataSection = () => {
  return (
    <>
      <Head>
        <title>Mariage d'Ariane & Timothe</title>
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
            Le site est en cours de construction
          </h1>
          <p className="text-muted-foreground">
            Veuillez vérifier plus tard pour les détails de notre jour spécial.
          </p>
        </div>
      </div>
    </>
  );
};

const MetaThemeChanger = () => {
  // Change theme-color meta tag on scroll direction
  const THEME_COLOR_NONE = '#FFFFFF';
  const THEME_COLOR_DEFAULT = '#95E1D3';
  const THEME_COLOR_MUTED = '#EAFFD0';
  const THEME_COLOR_ACCENT = '#F38181';
  // home -> default, nous -> none, informations -> accent,
  // logements -> accent, programme -> muted, rsvp -> accent, bonus -> muted
  const THEME_COLOR_MAP = {
    home: THEME_COLOR_DEFAULT,
    nous: THEME_COLOR_NONE,
    informations: THEME_COLOR_ACCENT,
    logements: THEME_COLOR_ACCENT,
    programme: THEME_COLOR_MUTED,
    rsvp: THEME_COLOR_MUTED,
    bonus: THEME_COLOR_MUTED,
  };

  // If the section is visible, set the theme-color to the corresponding color
  const setThemeColor = (sectionId: string) => {
    const color = THEME_COLOR_MAP[sectionId as keyof typeof THEME_COLOR_MAP];
    if (color) {
      let meta = document.querySelector(
        'meta[name="theme-color"]',
      ) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'theme-color';
        document.head.appendChild(meta);
      }
      if (meta.content !== color) {
        meta.content = color;
      }
    }
  };

  // Set initial color
  const timeout = setTimeout(() => {
    setThemeColor('home');
  }, 1000);

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    const onScroll = () => {
      clearTimeout(timeout);
      // get the id of the section in the view
      const sections = document.querySelectorAll('section');
      const sectionInView = Array.from(sections).find((section) => {
        const rect = section.getBoundingClientRect();

        return rect.top <= window.innerHeight && rect.bottom >= 0;
      });
      if (sectionInView) {
        setThemeColor(sectionInView.id);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);
  return null;
};

export default function HomePage({
  weddingInfo,
  accommodations,
  images,
  programs,
}: HomePageProps) {
  const scrollToSection = (
    sectionId: string,
    behavior: 'smooth' | 'instant' = 'smooth',
  ) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior });
    }
  };

  const getDirectionName = (directionType: string) => {
    return directionType === 'car'
      ? 'En voiture'
      : directionType === 'train'
        ? 'En train'
        : 'Location de voiture';
  };

  const heroImage = images.find((image) => image.usageLocation === 'hero');
  const accommodationsImage = images.find(
    (image) => image.usageLocation === 'accommodation',
  );
  const weddingDetailsImage = images.find(
    (image) => image.usageLocation === 'information',
  );

  if (!weddingInfo || weddingInfo.coupleNames === 'John Doe') {
    return <MissingDataSection />;
  }

  return (
    <>
      <Head>
        <title>{`${weddingInfo.coupleNames} `}</title>
        <meta
          name="description"
          content={`Venez fêter avec nous le mariage d'${weddingInfo.coupleNames}`}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MetaThemeChanger />
      {/* Progress Bar */}

      <NavbarLayout>
        <div className="min-h-screen bg-white">
          <HeroSection
            heroImage={heroImage as UploadedImage}
            weddingInfo={weddingInfo}
            scrollToSection={scrollToSection}
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
          <WeddingProgramSection programs={programs} />
          <RSVPSection />
          <BonusSection />
        </div>
      </NavbarLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    const isProd = process.env.NODE_ENV === 'production';
    const [weddingInfo, accommodations, images, programs] = await Promise.all([
      ApiService.getWeddingInfo(),
      ApiService.getAccommodations(),
      ApiService.getPublicImages(),
      ApiService.getPrograms(),
    ]);
    return {
      props: {
        weddingInfo,
        accommodations,
        images,
        programs,
      },
      // Revalidate every 60 seconds to keep data fresh
      revalidate: isProd ? 60 : 1,
    };
  } catch (error) {
    console.error('Error fetching wedding data:', error);
    return {
      props: {
        weddingInfo: null,
        accommodations: [],
        images: [],
        programs: [],
      },
      // Still revalidate even on error to retry
      revalidate: 60,
    };
  }
};

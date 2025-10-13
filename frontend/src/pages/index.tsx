import { MagneticButton } from '@/components/ui/magnetic-button';
import { WeddingAccomodations } from '@/components/wedding-accomodations';
import { WeddingHero } from '@/components/wedding-hero';
import { WeddingInformation } from '@/components/wedding-information';
import {
  NavbarTheme,
  navbarThemes,
  useNavbarTheme,
} from '@/context/navbar-theme-context';
import { cn } from '@/lib/utils';
import logger from '@/logger';
import ApiService from '@/services/api';
import { IconHeartHandshake } from '@tabler/icons-react';
import { GetServerSideProps } from 'next';
import { Parisienne } from 'next/font/google';
import Head from 'next/head';
import Image from 'next/image';
import { useEffect } from 'react';
import {
  DivWithAnimation,
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
    <Section id="home" className="h-screen min-h-screen">
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
      <div className="w-full h-full flex flex-col text-center  items-center ">
        <Image
          priority
          src="/images/capadocce.jpeg"
          alt="RSVP"
          width={2000}
          height={1000}
          className="lg:max-h-[50vh] h-[50vh] absolute z-0 object-cover object-center "
        />
        <DivWithAnimation className=" text-xl lg:text-6xl   text-theme-default z-1 pt-20 font-bold px-10 pb-5">
          Nous espérons vous voir nombreux en ce jour spécial !
        </DivWithAnimation>
        <DivWithAnimation className=" text-xl lg:text-4xl   text-theme-default z-1   font-bold pb-5">
          Réponse attendue avant le 28 février 2026
        </DivWithAnimation>
        <DivWithAnimation>
          <MagneticButton
            variant="stroke"
            className={cn(
              'h-10 lg:h-15 w-20 lg:w-30 rounded-full   hover:after:border-1    ',
              'text-theme-accent-dark',
              'hover:text-theme-default',
              'after:border-none',
              'bg-theme-default',
              'text-lg lg:text-2xl',
            )}
            flairClassName={cn('bg-theme-accent-dark ')}
            strokeColor={cn('bg-theme-accent-dark')}
            onClick={() =>
              window.open('https://form.typeform.com/to/JlsM3llP', '_blank')
            }
          >
            RSVP
          </MagneticButton>
        </DivWithAnimation>
      </div>
    </Section>
  );
};

const BonusSection = () => {
  return (
    <Section id="bonus" background="muted">
      <DivWithAnimation className="w-full h-[50vh] flex flex-col text-center justify-center items-center  gap-5">
        <span
          className={cn(
            bilbo.className,
            'text-2xl text-theme-accent-dark flex lg:flex-row flex-col items-center gap-2 pt-5',
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
      </DivWithAnimation>
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
  const { setTheme } = useNavbarTheme();

  const NAVCOLOR_MAP = {
    home: 'yellow',
    nous: 'white',
    informations: 'pink',
    logements: 'pink',
    programme: 'yellow',
    rsvp: 'transparent',
    bonus: 'transparent',
  };

  // If the section is visible, set the theme-color to the corresponding color
  const setThemeColor = (sectionId: keyof typeof NAVCOLOR_MAP) => {
    try {
      const key = NAVCOLOR_MAP[sectionId] as keyof typeof navbarThemes;
      if (navbarThemes[key]) setTheme(navbarThemes[key] as NavbarTheme);

      //eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {}
  };

  // Get navbar height dynamically
  const getNavbarHeight = () => {
    const navbar = document.getElementById('navbar') as HTMLElement;
    return navbar ? navbar.offsetHeight : 0;
  };

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    const onScroll = () => {
      const navbarHeight = getNavbarHeight();
      const viewportHeight = window.innerHeight;
      const scrollY = window.scrollY;

      // Get all sections
      const sections = document.querySelectorAll('section');

      // Find the section that the navbar is currently "touching"
      let currentSection = null;

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const sectionTop = rect.top + scrollY;
        const sectionBottom = sectionTop + rect.height;

        // Check if the navbar (at scrollY) is within this section's bounds
        // The navbar "touches" a section when scrollY is between sectionTop and sectionBottom
        if (scrollY >= sectionTop - navbarHeight && scrollY < sectionBottom) {
          currentSection = section;
        }
      });

      // If we are at the bottom of the page, set the theme to transparent
      if (
        window.innerHeight + window.scrollY + navbarHeight >=
        document.body.offsetHeight
      ) {
        setTheme(navbarThemes['transparent']);
      } else if (currentSection) {
        // Change theme when navbar touches the section
        const sectionId = (currentSection as HTMLElement)
          .id as keyof typeof NAVCOLOR_MAP;
        setThemeColor(sectionId);
      }
    };

    // Initial theme setting
    onScroll();

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

export const getServerSideProps: GetServerSideProps = async () => {
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
    };
  } catch (error) {
    console.error('Error fetching wedding data:', error);
    logger.error('Error fetching wedding data:', { error }, error);
    return {
      props: {
        weddingInfo: null,
        accommodations: [],
        images: [],
        programs: [],
      },
    };
  }
};

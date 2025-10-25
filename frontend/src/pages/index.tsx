import { LoadingProgress } from '@/components/loading-progress';
import { MagneticButton } from '@/components/ui';
import { WeddingAccomodations } from '@/components/wedding-accomodations';
import { WeddingHero } from '@/components/wedding-hero';
import { WeddingInformation } from '@/components/wedding-information';
import {
  NavbarTheme,
  navbarThemes,
  useNavbarTheme,
} from '@/context/navbar-theme-context';
import { cn } from '@/lib/utils';
import { logger } from '@/logger';
import { IconHeartHandshake } from '@tabler/icons-react';
import { Parisienne } from 'next/font/google';
import Head from 'next/head';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import {
  DivWithAnimation,
  NavbarLayout,
  Section,
  WeddingPresentation,
  WeddingProgram,
} from '../components';
import { ApiService } from '../services/api';
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
      className="xl:h-[50vh] xl:max-h-screen "
    >
      <WeddingProgram font={bilbo} events={programs} />
    </Section>
  );
};

const RSVPSection = () => {
  return (
    <Section id="rsvp" background="accent" className="h-[50vh] max-h-screen ">
      <div className="w-full h-full flex flex-col text-center  items-center  2xl:justify-center">
        <Image
          priority
          src="/images/capadocce.jpg"
          alt="RSVP"
          width={3440}
          height={1920}
          className="xl:max-h-[50vh] h-[50vh] absolute z-0 object-cover object-center "
        />
        <DivWithAnimation className=" text-3xl xl:text-6xl   text-theme-default z-1 pt-10 font-bold px-4 xl:px-10 pb-5 roundhand-bold">
          Nous espérons vous voir nombreux en ce jour spécial !
        </DivWithAnimation>
        <DivWithAnimation className=" text-2xl xl:text-4xl   text-theme-default z-1   font-bold pb-5 roundhand-bold">
          Réponse attendue avant le 28 février 2026
        </DivWithAnimation>
        <DivWithAnimation className="">
          <MagneticButton
            variant="stroke"
            className={cn(
              'h-10 xl:h-15 w-40 xl:w-60 rounded-full   hover:after:border-1   backdrop-blur-[2px] ',
              'text-theme-default',
              'hover:text-theme-accent-dark',
              'after:border-none',
              'bg-transparent ',
              'text-3xl xl:text-5xl',
            )}
            flairClassName={cn('bg-theme-default ')}
            strokeColor={cn('bg-theme-default')}
            onClick={() =>
              window.open(
                'https://app.youform.com/forms/i15ap0em?mariage=2026-07-13',
                '_blank',
              )
            }
          >
            R S V P
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
            'text-2xl text-theme-accent-dark flex xl:flex-row flex-col items-center gap-2 pt-5 2xl:text-4xl',
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

export default function HomePage() {
  // Client-side state for all data
  const [currentData, setCurrentData] = useState<{
    weddingInfo: WeddingInfo | null;
    accommodations: Accommodation[];
    images: UploadedImage[];
    programs: ProgramEvent[];
    lastUpdated: string;
  }>({
    weddingInfo: null,
    accommodations: [],
    images: [],
    programs: [],
    lastUpdated: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoadingProgress, setShowLoadingProgress] = useState(true);

  // Function to fetch fresh data from the API
  const fetchFreshData = async () => {
    try {
      setError(null);
      setIsLoading(true);
      console.log('Fetching fresh data from API...');

      const [
        freshWeddingInfo,
        freshAccommodations,
        freshImages,
        freshPrograms,
      ] = await Promise.all([
        ApiService.getWeddingInfo(),
        ApiService.getAccommodations(),
        ApiService.getPublicImages(),
        ApiService.getPrograms(),
      ]);

      setCurrentData({
        weddingInfo: freshWeddingInfo,
        accommodations: freshAccommodations,
        images: freshImages,
        programs: freshPrograms.map((program) => ({
          ...program,
          icon: program.icon || undefined,
        })),
        lastUpdated: new Date().toISOString(),
      });

      console.log('Fresh data fetched successfully');
    } catch (error) {
      console.error('Failed to fetch fresh data:', error);
      setError('Failed to load wedding data. Please try again later.');
      logger.error('Failed to fetch fresh data:', { error }, error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch on component mount
  useEffect(() => {
    fetchFreshData();
  }, []);

  // Use current data
  const {
    weddingInfo: displayWeddingInfo,
    accommodations: displayAccommodations,
    images: displayImages,
    programs: displayPrograms,
  } = currentData;

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

  const handleLoadingComplete = () => {
    setShowLoadingProgress(false);
  };

  const heroImage = displayImages.find(
    (image) => image.usageLocation === 'hero',
  );
  const accommodationsImage = displayImages.find(
    (image) => image.usageLocation === 'accommodation',
  );
  const weddingDetailsImage = displayImages.find(
    (image) => image.usageLocation === 'information',
  );

  // Show loading state

  // Show error state
  if (error && !displayWeddingInfo) {
    return (
      <>
        <Head>
          <title>Erreur - Mariage d'Ariane & Timothe</title>
          <meta
            name="description"
            content="Error loading wedding information"
          />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <h1 className="text-4xl text-foreground mb-4">
              Erreur de chargement
            </h1>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={fetchFreshData}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Réessayer
            </button>
          </div>
        </div>
      </>
    );
  }

  if (showLoadingProgress || !displayWeddingInfo) {
    return (
      <LoadingProgress
        endFunction={handleLoadingComplete}
        bilbo={bilbo}
        isLoading={isLoading}
      />
    );
  }

  return (
    <>
      <Head>
        <title>{`${displayWeddingInfo.coupleNames} `}</title>
        <meta
          name="description"
          content={`Venez fêter avec nous le mariage d'${displayWeddingInfo.coupleNames}`}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <MetaThemeChanger />

      <NavbarLayout>
        <div className="min-h-screen bg-white">
          <HeroSection
            heroImage={heroImage as UploadedImage}
            weddingInfo={displayWeddingInfo}
            scrollToSection={scrollToSection}
          />
          <OurStorySection weddingInfo={displayWeddingInfo} />
          <WeddingDetailsSection
            infoImage={weddingDetailsImage as UploadedImage}
            weddingInfo={displayWeddingInfo}
            getDirectionName={getDirectionName}
          />{' '}
          <AccommodationsSection
            accommodations={displayAccommodations}
            weddingInfo={displayWeddingInfo}
            accommodationsImage={accommodationsImage as UploadedImage}
          />
          <WeddingProgramSection programs={displayPrograms} />
          <RSVPSection />
          <BonusSection />
        </div>
      </NavbarLayout>
    </>
  );
}

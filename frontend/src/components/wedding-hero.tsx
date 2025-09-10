import { Button } from '@/components/ui/button';
import { Vortex } from '@/components/ui/vortex';
import { cn } from '@/lib/utils';
import { IconArrowDown } from '@tabler/icons-react';
import { NextFontWithVariable } from 'next/dist/compiled/@next/font';

export const WeddingHero = ({
  scrollToSection,
  font,
}: {
  scrollToSection: (sectionId: string) => void;
  font: NextFontWithVariable;
}) => (
  <Vortex
    backgroundColor="black"
    rangeY={800}
    baseHue={250}
    particleCount={250}
    className="flex items-center flex-col justify-center px-2 md:px-10  w-full h-screen"
  >
    <div className="relative grid grid-cols-6  items-center justify-center h-full w-full ">
      <p className="text-[#F38181] fraunces-regular col-span-1  text-2xl mb-2 font-light opacity-90 h-full w-full flex flex-col justify-end pb-10">
        Nous avons le plaisir de vous inviter à notre mariage le 13 Juillet 2026
      </p>{' '}
      <div className=" z-10 col-span-4  h-full w-full flex flex-col justify-center ">
        <div className="text-center text-white    flex flex-col items-center justify-center">
          <h1
            className={cn(
              'text-5xl md:text-7xl lg:text-9xl  mb-6 leading-tight color-black',
              font.className,
            )}
          >
            Ariane & Timothé
          </h1>

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
);

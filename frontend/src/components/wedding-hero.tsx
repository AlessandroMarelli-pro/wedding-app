import { Button } from '@/components/ui/button';
import { Vortex } from '@/components/ui/vortex';
import { cn } from '@/lib/utils';
import { IconArrowDown } from '@tabler/icons-react';
import { NextFontWithVariable } from 'next/dist/compiled/@next/font';
import Image from 'next/image';

export const WeddingHero = ({
  scrollToSection,
  font,
  maxCanvasHeight,
}: {
  scrollToSection: (sectionId: string) => void;
  font: NextFontWithVariable;
  maxCanvasHeight: number;
}) => (
  <Vortex
    backgroundColor="black"
    rangeY={800}
    baseHue={250}
    particleCount={250}
    height={maxCanvasHeight}
    className="flex items-center flex-col justify-center px-2 sm:px-10  w-full h-screen"
  >
    <div className="relative grid grid-rows-3  grid-cols-1 sm:grid-rows-1 sm:grid-cols-6  items-center justify-center h-full w-full ">
      <p className="text-[#F38181] fraunces-regular row-span-1 sm:col-span-1  text-2xl sm:mb-2 font-light  h-full w-full flex flex-col text-center sm:text-left justify-center sm:justify-end pb-10">
        Nous avons le plaisir de vous inviter à notre mariage le 13 Juillet 2026
      </p>{' '}
      <div className=" z-10 row-span-1 sm:col-span-4  h-full w-full flex flex-col items-center justify-center">
        <div className="text-center text-white    flex flex-col items-center justify-center">
          <h1
            className={cn(
              'text-5xl sm:text-9xl sm:mb-6 leading-tight color-black absolute w-full top-1/3 left-1/2 transform -translate-x-1/2  -translate-y-1/2',
              font.className,
            )}
          >
            Ariane & Timothé
          </h1>

          <Image
            width={1000}
            height={1000}
            src="/images/couple.jpeg"
            alt="Ariane and Timothé"
            className="sm:h-180  md:w-auto w-[90%]  md:absolute  z-[-1] rounded-t-[90%]   md:-bottom-5 md:translate-y-0 translate-y-10"
          />
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce   ">
            <Button
              className="bg-transparent text-white  items-center space-x-2 cursor-pointer md:flex hidden"
              onClick={() => scrollToSection('nous')}
            >
              <IconArrowDown />
              <span>Détails</span>
            </Button>
          </div>
        </div>
      </div>
      <p className=" text-[#F38181] md:translate-y-0 translate-y-10 fraunces-bold row-span-1 sm:col-span-1 text-2xl  font-light opacity-90 h-full w-full flex flex-col text-center sm:text-left justify-center sm:justify-end sm:pb-10 pt-10 sm:pt-0">
        Lauziers, Condillac
      </p>
    </div>
  </Vortex>
);

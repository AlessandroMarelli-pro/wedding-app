import { Button } from '@/components/ui/button';
import { Vortex } from '@/components/ui/vortex';
import { cn, getOptimizedUrl } from '@/lib/utils';
import { UploadedImage, WeddingInfo } from '@/types/api';
import { IconArrowDown } from '@tabler/icons-react';
import { NextFontWithVariable } from 'next/dist/compiled/@next/font';
import Image from 'next/image';
import { DivWithAnimation } from './animations';

export const WeddingHero = ({
  weddingInfo,
  heroImage,
  scrollToSection,
  font,
}: {
  weddingInfo: WeddingInfo;
  heroImage: UploadedImage;
  scrollToSection: (sectionId: string) => void;
  font: NextFontWithVariable;
}) => {
  return (
    <Vortex
      backgroundColor="black"
      rangeY={800}
      baseHue={150}
      particleCount={150}
      className="flex items-center flex-col justify-center px-2 xl:px-10  w-full h-screen"
    >
      <DivWithAnimation
        duration={1.5}
        className="relative grid grid-rows-3  grid-cols-1 xl:grid-rows-1 xl:grid-cols-6  items-center justify-center h-full w-full "
      >
        <p className="text-[#F38181]  row-span-1 xl:col-span-1  text-2xl xl:mb-2 font-light  h-full w-full flex flex-col text-center xl:text-left justify-center xl:justify-end pb-10">
          {weddingInfo.heroMessage}
        </p>{' '}
        <div className=" z-10 row-span-1 xl:col-span-4  h-full w-full flex flex-col items-center justify-center">
          <div className="text-center text-white    flex flex-col items-center justify-center">
            <h1
              className={cn(
                'text-5xl xl:text-9xl xl:mb-6 leading-tight color-black absolute w-full top-1/3 left-1/2 transform -translate-x-1/2  -translate-y-1/2',
                font.className,
              )}
            >
              {weddingInfo.coupleNames}
            </h1>

            <Image
              width={500}
              height={500}
              priority
              src={
                (heroImage && heroImage.cloudflareUrl) ||
                (heroImage && getOptimizedUrl(heroImage.id)) ||
                '/images/maries.webp'
              }
              alt="Ariane and Timothé"
              className="xl:h-180  xl:w-auto w-[90%]  xl:absolute  z-[-1] rounded-t-[90%]   xl:-bottom-5 xl:translate-y-0 translate-y-10"
            />
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce   ">
              <Button
                className="hover:bg-transparent bg-transparent text-white  items-center space-x-2 cursor-pointer xl:flex hidden"
                onClick={() => scrollToSection('nous')}
              >
                <IconArrowDown />
                <span>Détails</span>
              </Button>
            </div>
          </div>
        </div>
        <p className=" text-[#F38181]  translate-y-10 lg:translate-y-0 font-bold row-span-1 xl:col-span-1 text-2xl   opacity-90 h-full w-full flex flex-col text-center xl:text-left justify-center xl:justify-end xl:pb-10 pt-10 xl:pt-0">
          {weddingInfo.heroAddress}
        </p>
      </DivWithAnimation>
    </Vortex>
  );
};

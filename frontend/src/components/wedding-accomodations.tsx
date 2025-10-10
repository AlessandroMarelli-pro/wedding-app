import { cn } from '@/lib/utils';
import { UploadedImage, WeddingInfo } from '@/types/api';
import { NextFontWithVariable } from 'next/dist/compiled/@next/font';
import { AccommodationsList, DivWithAnimation } from '../components';
import { Accommodation } from '../types/api';

export const WeddingAccomodations = ({
  accommodationsImage,
  accommodations,
  weddingInfo,
  font,
}: {
  accommodationsImage: UploadedImage;
  accommodations: Accommodation[];
  weddingInfo: WeddingInfo;
  font: NextFontWithVariable;
}) => (
  <div className="space-y-4 ">
    <div className="flex flex-col lg:max-h-screen lg:h-screen">
      <div className="row-span-2">
        <div className="flex flex-col items-center justify-center min-h-10" />

        <DivWithAnimation className="row-span-1 flex flex-col justify-center items-center ">
          <div className="lg:h-full py-5   ">
            <h1
              className={cn(
                'text-5xl lg:text-8xl text-theme-accent-dark',
                'roundhand-regular',
              )}
            >
              Où dormir ?
            </h1>
            <span className="text-theme-accent-dark/80 text-sm lg:text-base">
              Quelques idées de logements pour votre séjour dromois!
            </span>
          </div>
        </DivWithAnimation>
        <DivWithAnimation className="row-span-1  flex flex-col max-h-[50%]">
          <AccommodationsList
            accommodations={accommodations}
            weddingInfo={{
              weddingAddress: weddingInfo.weddingAddress,
              weddingDate: weddingInfo.weddingDate,
              coupleNames: weddingInfo.coupleNames,
              locationDirections: weddingInfo.locationDirections,
            }}
          />
        </DivWithAnimation>
      </div>
      {/*       <div className=" row-span-2 xl:flex xl:flex-col justify-evenly">
        <DivWithAnimation className="row-span-1  flex flex-col ">
          <div className="text-center  flex flex-row items-center justify-around ">
            <Image
              src={
                (accommodationsImage && accommodationsImage.cloudflareUrl) ||
                (accommodationsImage &&
                  getOptimizedUrl(accommodationsImage.id)) ||
                '/images/condillac.webp'
              }
              alt={weddingInfo.coupleNames}
              width={600}
              height={600}
              className="object-cover w-full max-w-[50rem] "
            />
          </div>
        </DivWithAnimation>
      </div> */}
    </div>
  </div>
);

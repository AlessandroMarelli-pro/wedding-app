import { cn, getOptimizedUrl } from '@/lib/utils';
import { UploadedImage, WeddingInfo } from '@/types/api';
import { NextFontWithVariable } from 'next/dist/compiled/@next/font';
import Image from 'next/image';
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
    <div className="text-center grid  xl:grid-cols-2 xl:grid-rows-2 lg:grid-rows-4  lg:max-h-screen lg:h-screen">
      <div className="row-span-2">
        <DivWithAnimation className="row-span-1 flex flex-col justify-around ">
          <div className="lg:h-full ">
            <h1
              className={cn(
                'py-5  text-5xl lg:text-8xl text-[#EAFFD0]',
                font.className,
              )}
            >
              Où dormir ?
            </h1>
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
      <div className=" row-span-2 xl:flex xl:flex-col justify-evenly">
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
      </div>
    </div>
  </div>
);

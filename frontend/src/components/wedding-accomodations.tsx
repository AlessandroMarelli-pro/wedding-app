import { cn } from '@/lib/utils';
import { WeddingInfo } from '@/types/api';
import { NextFontWithVariable } from 'next/dist/compiled/@next/font';
import Image from 'next/image';
import { AccommodationsList } from '../components';
import { Accommodation } from '../types/api';

export const WeddingAccomodations = ({
  accommodations,
  weddingInfo,
  font,
}: {
  accommodations: Accommodation[];
  weddingInfo: WeddingInfo;
  font: NextFontWithVariable;
}) => (
  <div className="space-y-4 ">
    <div className=" rounded-xl sm:rounded-2xl   text-center grid  grid-cols-2 grid-rows-2  max-h-screen h-screen">
      <div className="row-span-2">
        <div className="row-span-1 flex flex-col justify-around ">
          <div className="h-full ">
            <h1 className={cn('py-5  text-8xl text-[#F38181]', font.className)}>
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
);

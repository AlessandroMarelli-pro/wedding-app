import { LinkPreview } from '@/components/ui/link-preview';
import { cn, getOptimizedUrl } from '@/lib/utils';
import { IconCar, IconMapPinFilled, IconTrain } from '@tabler/icons-react';
import { NextFontWithVariable } from 'next/dist/compiled/@next/font';
import Image from 'next/image';
import { UploadedImage, WeddingInfo } from '../types/api';

const WeddingHowToArriveIcons = {
  car: <IconCar className="lg:w-10 lg:h-10" />,
  train: <IconTrain className="lg:w-10 lg:h-10" />,
  'car rental': <IconCar className="lg:w-10 lg:h-10" />,
};

export const WeddingInformation = ({
  infoImage,
  weddingInfo,
  getDirectionName,
  font,
}: {
  infoImage: UploadedImage;
  weddingInfo: WeddingInfo;
  getDirectionName: (directionType: string) => string;
  font: NextFontWithVariable;
}) => {
  return (
    <div className="space-y-4 pb-4 lg:pb-0">
      <div className="text-center grid  grid-cols-1 lg:grid-cols-2  gap-6 lg:max-h-screen lg:h-screen">
        <div className=" row-span-2">
          <div className="row-span-1  flex flex-col">
            <div className="text-center  flex flex-row   gap-10">
              <Image
                src={
                  (infoImage && getOptimizedUrl(infoImage.id)) ||
                  '/images/lauziers.webp'
                }
                alt={weddingInfo.coupleNames}
                width={600}
                height={600}
                className="object-cover w-full lg:max-h-[30rem]"
              />
            </div>
          </div>
          <div className="row-span-1  flex flex-col h-[50%] xl:h-[40%]  justify-around">
            <h1
              className={cn(
                'text-[#EAFFD0]  text-5xl xl:text-8xl my-4',
                font.className,
              )}
            >
              Le lieu
            </h1>
            <div>
              {weddingInfo.weddingAddress.split(',').map((chunk) => (
                <p
                  key={chunk}
                  className="text-md lg:text-xl text-[#EAFFD0] font-light"
                >
                  {chunk}
                </p>
              ))}
            </div>
          </div>
        </div>
        {weddingInfo.locationDirections &&
          weddingInfo.locationDirections.length > 0 && (
            <div className="row-span-2 flex flex-col justify-around">
              <div className="row-span-1 flex flex-col  ">
                <div className="h-full ">
                  <h1
                    className={cn(
                      'py-5  text-5xl xl:text-8xl text-[#EAFFD0]',
                      font.className,
                    )}
                  >
                    Comment venir ?
                  </h1>
                </div>
              </div>
              <div className="row-span-1  flex flex-col  gap-4">
                {weddingInfo.locationDirections.map((direction, index) => (
                  <div
                    key={index}
                    className="relative flex flex-col   items-center rounded-lg   p-3"
                  >
                    <div className="flex items-center mb-1 gap-2 text-[#EAFFD0]">
                      {WeddingHowToArriveIcons[direction.type]}
                      <h5 className="font-medium text-[#EAFFD0] capitalize text-xl lg:text-3xl  ">
                        {getDirectionName(direction.type)}
                      </h5>
                    </div>
                    <p className="block text-white  leading-normal   mb-1 text-md text-center">
                      {direction.information
                        .split('.')
                        .filter((line) => line.trim() !== '')
                        .map((line, index) => (
                          <span key={index}>
                            {line + '.'}
                            <br />
                          </span>
                        ))}
                    </p>
                    <div className="text-left flex flex-row items-center gap-2">
                      <span className="text-sm text-white ">
                        <IconMapPinFilled className="w-4 h-4" />
                      </span>
                      <LinkPreview
                        width={300}
                        height={200}
                        url={direction.location.link || ''}
                        className="text-[#EAFFD0] underline text-sm target:blank"
                      >
                        {direction.location.address}
                      </LinkPreview>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

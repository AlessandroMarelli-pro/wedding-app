import {
  convertTextWithLinksToReactNodes,
  LinkPreview,
} from '@/components/ui/link-preview';
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
      <div className="lg:max-h-screen lg:h-screen flex flex-col lg:flex-row gap-10 lg:gap-0">
        <div className="flex flex-col lg:w-[50%] gap-10 lg:gap-0">
          <div className=" flex flex-row  ">
            <Image
              src={
                (infoImage && infoImage.cloudflareUrl) ||
                (infoImage && getOptimizedUrl(infoImage.id)) ||
                '/images/lauziers.webp'
              }
              alt={weddingInfo.coupleNames}
              width={6000}
              height={600}
              className="object-cover w-full "
            />
          </div>
          <div className=" flex flex-row h-full  w-full text-center">
            <div className="flex flex-col justify-around items-center w-full">
              <h1
                className={cn(
                  'text-[#EAFFD0]  text-7xl xl:text-8xl pb-10 lg:pb-0 ',
                  font.className,
                )}
              >
                Le lieu
              </h1>
              <div>
                {weddingInfo.weddingAddress?.split(',').map((chunk) => (
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
        </div>
        <div className="flex flex-col  lg:w-[50%]  gap-10 lg:gap-0">
          <div className="flex flex-row h-[25%] w-full text-center justify-center items-center ">
            <div className="flex flex-colh-full ">
              <h1
                className={cn(
                  ' text-5xl xl:text-8xl text-[#EAFFD0]',
                  font.className,
                )}
              >
                Comment venir ?
              </h1>
            </div>
          </div>
          <div className="flex flex-row h-[75%] w-full pb-10">
            <div className="flex flex-col text-center justify-end items-center w-full gap-10">
              {weddingInfo.locationDirections?.map((direction, index) => (
                <div
                  key={index}
                  className=" flex flex-col justify-center items-center w-full"
                >
                  <div className="flex   text-[#EAFFD0]">
                    {WeddingHowToArriveIcons[direction.type]}
                    <h5 className="font-medium text-[#EAFFD0] capitalize text-xl lg:text-3xl  ">
                      {getDirectionName(direction.type)}
                    </h5>
                  </div>
                  <div className=" text-white  text-sm lg:text-base px-10 lg:px-0 ">
                    {convertTextWithLinksToReactNodes(
                      direction.information,
                      'text-[#EAFFD0]',
                    )}
                  </div>
                  <div className=" flex flex-row justify-center items-center w-full">
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
        </div>
      </div>
    </div>
  );
};

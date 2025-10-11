import {
  convertTextWithLinksToReactNodes,
  LinkPreview,
} from '@/components/ui/link-preview';
import { cn } from '@/lib/utils';
import { IconCar, IconMapPinFilled, IconTrain } from '@tabler/icons-react';
import { NextFontWithVariable } from 'next/dist/compiled/@next/font';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { UploadedImage, WeddingInfo } from '../types/api';
import { DivWithAnimation } from './animations';

const BrowserStylePainting = dynamic(() => import('./browser-style-painting'));

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
  const [isInViewport, setIsInViewport] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  // Intersection Observer to detect when component enters viewport
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          console.log('Intersection Observer:', entry.isIntersecting);
          if (entry.isIntersecting) {
            setIsInViewport(true);
            setIsLoaded(true);
          } else {
            setIsInViewport(false);
          }
        });
      },
      {
        threshold: 0.2, // Trigger when 10% of the component is visible
        rootMargin: '10px', // Start animation 50px before component enters viewport
      },
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [isInViewport]);
  console.log('isInViewport', isInViewport);
  return (
    <div className="space-y-4 pb-4 lg:pb-0">
      <div className="lg:max-h-screen lg:h-screen flex flex-col lg:flex-row  lg:gap-0">
        <div className="flex flex-col lg:w-[50%] gap-10 lg:gap-0">
          <div className=" flex flex-col items-center justify-center lg:min-h-10" />

          <div
            ref={containerRef}
            className="hidden lg:flex flex-col items-center justify-center h-full "
          >
            {(isInViewport || isLoaded) && (
              <BrowserStylePainting
                scaleMultiplier={1}
                src="/images/lauziers.svg"
                alt={weddingInfo.coupleNames}
                className=" w-1/2"
                duration={4000}
                delay={5}
                pathDelay={10}
                useSetMode={false}
                setPercentage={4}
              />
            )}
            {/*  <Image
              src={'/images/Lauziers2.png'}
              alt={weddingInfo.coupleNames}
              width={6000}
              height={600}
              className="object-cover w-[100%] "
            /> */}
          </div>
        </div>
        <div className="flex flex-col  lg:min-h-10" />
        <div className="flex flex-col  lg:w-[50%] gap-10 justify-start items-center text-center  ">
          <div className="flex flex-col  min-h-15" />
          <DivWithAnimation>
            <h1
              className={cn(
                'text-theme-accent-dark  text-7xl xl:text-8xl pb-10 lg:pb-0 ',
                'roundhand-regular',
              )}
            >
              Le lieu
            </h1>
          </DivWithAnimation>
          <DivWithAnimation>
            <div>
              {weddingInfo.weddingAddress?.split(',').map((chunk) => (
                <p
                  key={chunk}
                  className="text-md lg:text-lg text-theme-accent-dark font-regular"
                >
                  {chunk}
                </p>
              ))}
            </div>
          </DivWithAnimation>
          <DivWithAnimation className="lg:hidden flex flex-col items-center justify-center h-full ">
            <Image
              src={'/images/Lauziers2.png'}
              alt={weddingInfo.coupleNames}
              width={6000}
              height={600}
              className="object-cover w-[100%] "
            />
          </DivWithAnimation>
          <DivWithAnimation>
            <h1
              className={cn(
                ' text-5xl xl:text-8xl text-theme-accent-dark',
                'roundhand-regular',
              )}
            >
              Comment venir ?
            </h1>
          </DivWithAnimation>
          <DivWithAnimation>
            <div className="flex flex-col text-center justify-around items-center w-full gap-10">
              {weddingInfo.locationDirections?.map((direction, index) => (
                <div
                  key={index}
                  className=" flex flex-col justify-center items-center w-full gap-2"
                >
                  <div className="flex   text-theme-accent-dark items-end gap-2">
                    <h5 className="font-medium text-theme-accent-dark capitalize text-xl lg:text-2xl  ">
                      {getDirectionName(direction.type)}
                    </h5>
                    {WeddingHowToArriveIcons[direction.type]}
                  </div>
                  <div className=" text-theme-accent-dark/80  text-sm lg:text-base px-10 lg:px-0 ">
                    {convertTextWithLinksToReactNodes(
                      direction.information,
                      'text-theme-accent-dark/80',
                    )}
                  </div>
                  <div className=" flex flex-row justify-center items-center w-full">
                    <span className="text-sm text-theme-accent-dark/80 ">
                      <IconMapPinFilled className="w-4 h-4" />
                    </span>
                    <LinkPreview
                      width={300}
                      height={200}
                      url={direction.location.link || ''}
                      className="text-theme-accent-dark underline text-sm "
                    >
                      {direction.location.address}
                    </LinkPreview>
                  </div>
                </div>
              ))}
            </div>
          </DivWithAnimation>
        </div>
      </div>
    </div>
  );
};

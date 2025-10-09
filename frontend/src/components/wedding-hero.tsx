import { UploadedImage, WeddingInfo } from '@/types/api';
import { NextFontWithVariable } from 'next/dist/compiled/@next/font';
import { BrowserStylePainting } from './browser-style-painting';

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
    <div className="flex items-center flex-col justify-center px-2 xl:px-10 w-full h-screen bg-theme-default ">
      <BrowserStylePainting
        src="/images/aqua.svg"
        alt="Ariane and Timothé"
        className="h-screen w-fit object-cover"
        duration={400}
        delay={50}
        pathDelay={100}
        useSetMode={true}
        setPercentage={4}
      />
      <h1 className="absolute text-theme-accent-dark text-4xl xl:text-6xl font-bold top-[calc(10%)] left-[calc(50%)] roundhand-regular">
        {weddingInfo.coupleNames}
      </h1>
      <h1 className="absolute text-theme-blue text-4xl xl:text-5xl font-bold bottom-[calc(13%)] left-[calc(59%)] roundhand-bold">
        {weddingInfo.heroMessage}
      </h1>
      <h1 className="absolute text-theme-blue text-4xl xl:text-5xl font-bold bottom-[calc(5%)] left-[calc(55%)] roundhand-regular">
        {weddingInfo.heroAddress}
      </h1>
    </div>
  );
};

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
        delay={100}
        pathDelay={1}
      />
    </div>
  );
};

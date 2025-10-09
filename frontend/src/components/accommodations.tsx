import { IconCurrencyEuro, IconMapPin } from '@tabler/icons-react';
import { Accommodation, WeddingInfo } from '../types/api';
import ExpandableCardDemo from './expandable-card-demo-standard';

interface AccommodationsListProps {
  accommodations: Accommodation[];
  weddingInfo: Pick<
    WeddingInfo,
    'weddingAddress' | 'weddingDate' | 'coupleNames' | 'locationDirections'
  >;
}

export function AccommodationsList({
  accommodations,
  weddingInfo,
}: AccommodationsListProps) {
  [...accommodations].sort((a, b) => a.displayOrder - b.displayOrder);

  const cards = accommodations.map((accommodation) => {
    return {
      id: accommodation.randomId,
      title: accommodation.name,
      description: accommodation.address,
      src: accommodation?.imagesUrl?.split(',')[0],
      image2: accommodation?.imagesUrl?.split(',')[1],
      image3: accommodation?.imagesUrl?.split(',')[2],
      ctaText: accommodation.isRecommended ? 'Recommandé' : '',
      ctaLink: accommodation.sourceUrl || 'https://ui.aceternity.com/templates',
      imagesUrl: accommodation.imagesUrl?.split(',') || [],
      content: () => {
        return (
          <div className="p-4 flex flex-col gap-4 pt-0">
            <p className=" leading-relaxed text-base  pt-4 text-justify z-10">
              {accommodation.description
                .split('.')
                .filter((sentence) => sentence.trim() !== '')
                .map((sentence, index) => (
                  <span key={index}>
                    {sentence + '.'}
                    <br />
                  </span>
                ))}
            </p>
            <div className=" flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex items-center lg:space-x-3">
                <IconMapPin className="w-4 h-4 lg:w-8 lg:h-8   flex-shrink-0" />
                <p className="lg:text-sm text-xs font-medium">
                  {accommodation.address}
                </p>
              </div>

              {accommodation.priceRange && (
                <div className="flex items-center lg:space-x-3">
                  <IconCurrencyEuro className="w-4 h-4 lg:w-8 lg:h-8  flex-shrink-0" />
                  <p className="lg:text-sm text-xs font-medium">
                    {accommodation.priceRange?.replace('€', '').replace('', '')}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      },
    };
  });
  return (
    <div className="p-4 grid grid-cols-2 gap-4 items-start lg:h-full">
      <div className="col-span-2">
        <ExpandableCardDemo cards={cards} />
      </div>
    </div>
  );
}

import { Card, CardContent } from '@/components/ui';
import { IconCurrencyEuro, IconMapPin } from '@tabler/icons-react';
import { Accommodation, Direction } from '../types/api';
import ExpandableCardDemo from './expandable-card-demo-standard';
import { AccommodationMap } from './maps';

interface AccommodationsListProps {
  accommodations: Accommodation[];
  weddingInfo: {
    weddingAddress: string;
    weddingDate: string;
    coupleNames: string;
    locationDirections?: Direction[];
    latitude?: number;
    longitude?: number;
  };
}

export function AccommodationsList({
  accommodations,
  weddingInfo,
}: AccommodationsListProps) {
  const sortedAccommodations = [...accommodations].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );

  if (accommodations.length === 0) {
    return (
      <Card className="bg-card/60 backdrop-blur-sm border shadow-lg">
        <CardContent className="text-center py-12">
          <IconMapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Accommodation recommendations will be available soon.
          </p>
        </CardContent>
      </Card>
    );
  }

  const cards = accommodations.map((accommodation) => {
    return {
      title: accommodation.name,
      description: accommodation.address,
      src:
        accommodation?.imagesUrl?.split(',')[0] ||
        'https://assets.aceternity.com/demos/lana-del-rey.jpeg',
      ctaText: accommodation.isRecommended ? 'Recommandé' : '',
      ctaLink: accommodation.sourceUrl || 'https://ui.aceternity.com/templates',
      imagesUrl: accommodation.imagesUrl?.split(',') || [],
      content: () => {
        return (
          <div className="p-4 flex flex-col gap-4">
            <p className=" leading-relaxed text-sm  pt-4">
              {accommodation.description}
            </p>
            <div className=" flex flex-row gap-4 items-center">
              <div className="flex items-center space-x-3">
                <IconMapPin className="w-8 h-8 text-white  flex-shrink-0" />
                <p className="text-sm font-medium">{accommodation.address}</p>
              </div>

              {accommodation.priceRange && (
                <div className="flex items-center space-x-3">
                  <IconCurrencyEuro className="w-8 h-8 text-white flex-shrink-0" />
                  <p className="text-sm  font-medium">
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
    <div className="p-4 grid grid-cols-2 gap-4 items-start h-full">
      {/* Interactive Map */}
      <div className="col-span-1">
        {accommodations.length > 0 && (
          <div className="">
            <AccommodationMap
              accommodations={accommodations}
              weddingInfo={weddingInfo}
              showDirections={false}
              showDetails={false}
              className="mb-6 sm:mb-8"
            />
          </div>
        )}
      </div>
      <div className="col-span-1">
        <ExpandableCardDemo cards={cards} />
      </div>
    </div>
  );
}

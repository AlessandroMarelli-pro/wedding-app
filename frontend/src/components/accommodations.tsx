import { Accommodation, WeddingInfo } from '../types/api';
import AccommodationSlider from './accommodation-slider';

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

  return (
    <div className="w-full h-screen">
      <AccommodationSlider accommodations={accommodations} />
    </div>
  );
}

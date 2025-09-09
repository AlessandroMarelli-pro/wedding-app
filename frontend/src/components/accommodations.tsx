import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { DollarSign, ExternalLink, MapPin, Phone, Star } from 'lucide-react';
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
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Accommodation recommendations will be available soon.
          </p>
        </CardContent>
      </Card>
    );
  }

  const AccommodationCard = ({
    accommodation,
  }: {
    accommodation: Accommodation;
  }) => {
    const openMaps = () => {
      if (accommodation.latitude && accommodation.longitude) {
        window.open(
          `https://maps.google.com/?q=${accommodation.latitude},${accommodation.longitude}`,
          '_blank',
        );
      } else {
        window.open(
          `https://maps.google.com/?q=${encodeURIComponent(accommodation.address)}`,
          '_blank',
        );
      }
    };

    return (
      <Card className="bg-card/60 backdrop-blur-sm border shadow-lg hover:shadow-xl transition-all duration-300 group">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <CardTitle className="text-xl  text-foreground group-hover:text-primary transition-colors">
              {accommodation.name}
            </CardTitle>
            {accommodation.isRecommended && (
              <Badge
                variant="default"
                className="bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500"
              >
                <Star className="w-3 h-3 mr-1" />
                Recommandé
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            {accommodation.description}
          </p>

          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <MapPin className="w-4 h-4 text-rose-500 mt-1 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                {accommodation.address}
              </p>
            </div>

            {accommodation.contactInfo && (
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  {accommodation.contactInfo}
                </p>
              </div>
            )}

            {accommodation.priceRange && (
              <div className="flex items-center space-x-3">
                <DollarSign className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <p className="text-sm text-muted-foreground font-medium">
                  {accommodation.priceRange}
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={openMaps}
              className="touch-target w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Voir sur Maps
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };
  const cards = accommodations.map((accommodation) => {
    return {
      description: accommodation.name,
      title: accommodation.address,
      src: 'https://assets.aceternity.com/demos/lana-del-rey.jpeg',
      ctaText: accommodation.isRecommended ? 'Recommandé' : "Plus d'options",
      ctaLink: 'https://ui.aceternity.com/templates',
      content: () => {
        return (
          <div>
            {' '}
            <p className="text-muted-foreground leading-relaxed">
              {accommodation.description}
            </p>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-rose-500 mt-1 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  {accommodation.address}
                </p>
              </div>

              {accommodation.contactInfo && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-rose-500 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    {accommodation.contactInfo}
                  </p>
                </div>
              )}

              {accommodation.priceRange && (
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-4 h-4 text-rose-500 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground font-medium">
                    {accommodation.priceRange}
                  </p>
                </div>
              )}
            </div>
            <div className="pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                //onClick={openMaps}
                className="touch-target w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Voir sur Maps
              </Button>
            </div>
          </div>
        );
      },
    };
  });
  return (
    <div className="p-4 grid grid-cols-2 gap-4 items-center">
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

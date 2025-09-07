import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { DollarSign, ExternalLink, MapPin, Phone, Star } from 'lucide-react';

interface Accommodation {
  id: string;
  name: string;
  description: string;
  address: string;
  contactInfo?: string;
  priceRange?: string;
  isRecommended: boolean;
  displayOrder: number;
  latitude?: number;
  longitude?: number;
}

interface AccommodationsListProps {
  accommodations: Accommodation[];
}

export function AccommodationsList({
  accommodations,
}: AccommodationsListProps) {
  const sortedAccommodations = [...accommodations].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );
  const recommended = sortedAccommodations.filter((acc) => acc.isRecommended);
  const others = sortedAccommodations.filter((acc) => !acc.isRecommended);

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
            <CardTitle className="text-xl font-serif text-foreground group-hover:text-primary transition-colors">
              {accommodation.name}
            </CardTitle>
            {accommodation.isRecommended && (
              <Badge
                variant="default"
                className="bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500"
              >
                <Star className="w-3 h-3 mr-1" />
                Recommended
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
              className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View on Maps
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-12">
      {recommended.length > 0 && (
        <div>
          <div className="text-center mb-8">
            <h3 className="text-2xl font-serif text-foreground mb-2">
              Our Recommendations
            </h3>
            <p className="text-muted-foreground">
              These are our top picks for your stay
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommended.map((accommodation) => (
              <AccommodationCard
                key={accommodation.id}
                accommodation={accommodation}
              />
            ))}
          </div>
        </div>
      )}

      {others.length > 0 && (
        <div>
          {recommended.length > 0 && (
            <div className="text-center mb-8">
              <h3 className="text-2xl font-serif text-foreground mb-2">
                More Options
              </h3>
              <p className="text-muted-foreground">
                Additional accommodations in the area
              </p>
            </div>
          )}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {others.map((accommodation) => (
              <AccommodationCard
                key={accommodation.id}
                accommodation={accommodation}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

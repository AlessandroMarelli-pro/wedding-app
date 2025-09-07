interface Accommodation {
  id: string;
  name: string;
  description: string;
  address: string;
  contactInfo?: string;
  priceRange?: string;
  isRecommended: boolean;
  displayOrder: number;
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
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-rose-100 text-center">
        <p className="text-gray-600">
          Accommodation recommendations will be available soon.
        </p>
      </div>
    );
  }

  const AccommodationCard = ({
    accommodation,
  }: {
    accommodation: Accommodation;
  }) => (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-rose-100 hover:shadow-xl transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-2xl font-serif text-gray-800">
          {accommodation.name}
        </h3>
        {accommodation.isRecommended && (
          <span className="bg-gradient-to-r from-rose-400 to-pink-400 text-white px-3 py-1 rounded-full text-sm font-medium">
            Recommended
          </span>
        )}
      </div>

      <p className="text-gray-700 mb-6 leading-relaxed">
        {accommodation.description}
      </p>

      <div className="space-y-3">
        <div className="flex items-start">
          <svg
            className="w-5 h-5 text-rose-500 mt-0.5 mr-3 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <p className="text-gray-600">{accommodation.address}</p>
        </div>

        {accommodation.contactInfo && (
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-rose-500 mr-3 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            <p className="text-gray-600">{accommodation.contactInfo}</p>
          </div>
        )}

        {accommodation.priceRange && (
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-rose-500 mr-3 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
            <p className="text-gray-600 font-medium">
              {accommodation.priceRange}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-12">
      {recommended.length > 0 && (
        <div>
          <h3 className="text-2xl font-serif text-gray-800 mb-8 text-center">
            Our Recommendations
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
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
            <h3 className="text-2xl font-serif text-gray-800 mb-8 text-center">
              Other Options
            </h3>
          )}
          <div className="grid md:grid-cols-2 gap-8">
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

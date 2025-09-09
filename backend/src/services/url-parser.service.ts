import { BadRequestException, Injectable } from '@nestjs/common';
import { PythonScraperService } from './python-scraper.service';

export interface ParsedAccommodationData {
  name: string;
  description: string;
  address: string;
  contactInfo?: string;
  priceRange?: string;
  imagesUrl?: string;
  sourceUrl: string;
  error?: string;
}

@Injectable()
export class UrlParserService {
  constructor(private readonly pythonScraperService: PythonScraperService) {}

  async parseAccommodationUrl(url: string): Promise<ParsedAccommodationData> {
    try {
      // First try Python scraper for detailed extraction
      const scrapedData =
        await this.pythonScraperService.scrapeAccommodation(url);
      console.info('scrapedData', scrapedData);

      // If Python scraper returned valid data, use it
      if (scrapedData && !scrapedData.error) {
        return scrapedData;
      }

      // Fallback to basic URL parsing
      const urlObj = new URL(url);
      const domain = urlObj.hostname.toLowerCase();

      // Airbnb parsing
      if (domain.includes('airbnb.com') || domain.includes('airbnb.fr')) {
        return this.parseAirbnbUrl(url);
      }

      // Booking.com parsing
      if (domain.includes('booking.com')) {
        return this.parseBookingUrl(url);
      }

      // Hostelworld parsing
      if (domain.includes('hostelworld.com')) {
        return this.parseHostelworldUrl(url);
      }

      // Hotels.com parsing
      if (domain.includes('hotels.com')) {
        return this.parseHotelsUrl(url);
      }

      // Generic parsing for other accommodation sites
      return this.parseGenericUrl(url);
    } catch (error) {
      throw new BadRequestException('Invalid URL provided');
    }
  }

  private async parseAirbnbUrl(url: string): Promise<ParsedAccommodationData> {
    // For Airbnb, we'll extract basic info from the URL and provide a template
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const roomId = pathParts[pathParts.length - 1];

    return {
      name: 'Airbnb Property',
      description:
        'Property found on Airbnb. Please fill in the details manually.',
      address: 'Address not available - please fill in manually',
      contactInfo: 'Contact information not available',
      priceRange: 'Price range not available',
      imagesUrl: url, // Store the original URL as images source
      sourceUrl: url,
    };
  }

  private async parseBookingUrl(url: string): Promise<ParsedAccommodationData> {
    // For Booking.com, we'll extract basic info from the URL
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const hotelName = pathParts[pathParts.length - 1]?.replace(/-/g, ' ');

    return {
      name: hotelName
        ? this.capitalizeWords(hotelName)
        : 'Booking.com Property',
      description:
        'Property found on Booking.com. Please fill in the details manually.',
      address: 'Address not available - please fill in manually',
      contactInfo: 'Contact information not available',
      priceRange: 'Price range not available',
      imagesUrl: url, // Store the original URL as images source
      sourceUrl: url,
    };
  }

  private async parseHostelworldUrl(
    url: string,
  ): Promise<ParsedAccommodationData> {
    // For Hostelworld, we'll extract basic info from the URL
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const hostelName = pathParts[pathParts.length - 1]?.replace(/-/g, ' ');

    return {
      name: hostelName
        ? this.capitalizeWords(hostelName)
        : 'Hostelworld Property',
      description:
        'Property found on Hostelworld. Please fill in the details manually.',
      address: 'Address not available - please fill in manually',
      contactInfo: 'Contact information not available',
      priceRange: 'Price range not available',
      imagesUrl: url, // Store the original URL as images source
      sourceUrl: url,
    };
  }

  private async parseHotelsUrl(url: string): Promise<ParsedAccommodationData> {
    // For Hotels.com, we'll extract basic info from the URL
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const hotelName = pathParts[pathParts.length - 1]?.replace(/-/g, ' ');

    return {
      name: hotelName ? this.capitalizeWords(hotelName) : 'Hotels.com Property',
      description:
        'Property found on Hotels.com. Please fill in the details manually.',
      address: 'Address not available - please fill in manually',
      contactInfo: 'Contact information not available',
      priceRange: 'Price range not available',
      imagesUrl: url, // Store the original URL as images source
      sourceUrl: url,
    };
  }

  private async parseGenericUrl(url: string): Promise<ParsedAccommodationData> {
    // Generic parsing for unknown accommodation sites
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace('www.', '');
    const pathParts = urlObj.pathname.split('/');
    const propertyName = pathParts[pathParts.length - 1]?.replace(/-/g, ' ');

    return {
      name: propertyName
        ? this.capitalizeWords(propertyName)
        : `${domain} Property`,
      description: `Property found on ${domain}. Please fill in the details manually.`,
      address: 'Address not available - please fill in manually',
      contactInfo: 'Contact information not available',
      priceRange: 'Price range not available',
      imagesUrl: url, // Store the original URL as images source
      sourceUrl: url,
    };
  }

  private capitalizeWords(str: string): string {
    return str
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  isValidAccommodationUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.toLowerCase();

      // Check if it's a known accommodation platform
      const accommodationDomains = [
        'airbnb.com',
        'airbnb.fr',
        'booking.com',
        'hostelworld.com',
        'hotels.com',
        'expedia.com',
        'tripadvisor.com',
        'agoda.com',
        'trivago.com',
        'kayak.com',
        'priceline.com',
        'orbitz.com',
        'hotwire.com',
        'vrbo.com',
        'homeaway.com',
      ];

      return accommodationDomains.some((domainName) =>
        domain.includes(domainName),
      );
    } catch {
      return false;
    }
  }
}

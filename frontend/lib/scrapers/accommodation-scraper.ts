import { Browser, Page } from 'puppeteer-core';
import { launchPuppeteerBrowser } from '../puppeteer-config';

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

export class AccommodationScraper {
  private browser: Browser | null = null;

  async scrapeAccommodation(url: string): Promise<ParsedAccommodationData> {
    try {
      // Parse URL to determine platform
      const urlObj = new URL(url);
      const domain = urlObj.hostname.toLowerCase();

      if (domain.includes('airbnb.com') || domain.includes('airbnb.fr')) {
        return await this.scrapeAirbnb(url);
      } else if (domain.includes('booking.com')) {
        return await this.scrapeBooking(url);
      } else {
        return this.createFallbackResponse(url, 'Unsupported Platform');
      }
    } catch (error) {
      return this.createFallbackResponse(url, `Scraping failed: ${error}`);
    }
  }

  private async scrapeAirbnb(url: string): Promise<ParsedAccommodationData> {
    try {
      // Try with Puppeteer first
      console.log('🔍 Attempting Airbnb scraping with Puppeteer...');
      const puppeteerResult = await this.scrapeAirbnbWithPuppeteer(url);
      if (puppeteerResult && !puppeteerResult.error) {
        console.log('✅ Airbnb Puppeteer scraping successful');
        return puppeteerResult;
      }

      console.log(
        '⚠️ Airbnb Puppeteer scraping failed, falling back to basic parsing',
      );
      // Fallback to basic URL parsing
      return this.parseAirbnbUrl(url);
    } catch (error) {
      console.error('❌ Airbnb scraping error:', error);
      return this.createFallbackResponse(
        url,
        `Airbnb scraping failed: ${error}`,
      );
    }
  }

  private async scrapeBooking(url: string): Promise<ParsedAccommodationData> {
    try {
      // Try with Puppeteer first
      console.log('🔍 Attempting Booking.com scraping with Puppeteer...');
      const puppeteerResult = await this.scrapeBookingWithPuppeteer(url);
      if (puppeteerResult && !puppeteerResult.error) {
        console.log('✅ Booking.com Puppeteer scraping successful');
        return puppeteerResult;
      }

      console.log(
        '⚠️ Booking.com Puppeteer scraping failed, falling back to basic parsing',
      );
      // Fallback to basic URL parsing
      return this.parseBookingUrl(url);
    } catch (error) {
      console.error('❌ Booking.com scraping error:', error);
      return this.createFallbackResponse(
        url,
        `Booking.com scraping failed: ${error}`,
      );
    }
  }

  private async scrapeAirbnbWithPuppeteer(
    url: string,
  ): Promise<ParsedAccommodationData> {
    let page: Page | null = null;

    try {
      this.browser = await launchPuppeteerBrowser();

      page = await this.browser.newPage();

      // Set realistic user agent
      await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      );

      // Navigate to the page
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      // Wait for content to load
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Extract data using page.evaluate
      const data = await page.evaluate(() => {
        const getTextContent = (selector: string): string | null => {
          const element = document.querySelector(selector);
          return element ? element.textContent?.trim() || null : null;
        };

        const getImageUrls = (selector: string): string[] => {
          const elements = document.querySelectorAll(selector);
          const urls: string[] = [];
          elements.forEach((el) => {
            const src = el.getAttribute('src') || el.getAttribute('data-src');
            if (src && src.startsWith('http')) {
              urls.push(src);
            }
          });
          return urls.slice(0, 5); // Limit to 5 images
        };

        // Try multiple selectors for each field
        const name =
          getTextContent('h1[data-testid="listing-title"]') ||
          getTextContent('h1._14i3z6h') ||
          getTextContent('h1[data-section-id="TITLE_DEFAULT"] h1') ||
          getTextContent('h1') ||
          'Airbnb Property';

        const description =
          getTextContent('[data-testid="listing-description"]') ||
          getTextContent('._1n81at5') ||
          getTextContent('[data-section-id="DESCRIPTION_DEFAULT"] div') ||
          getTextContent('.description') ||
          'Property found on Airbnb. Please fill in the details manually.';

        const address =
          getTextContent('[data-testid="listing-location"]') ||
          getTextContent('[data-section-id="LOCATION_DEFAULT"] div') ||
          getTextContent('.location') ||
          'Address not available - please fill in manually';

        const priceRange =
          getTextContent('[data-testid="price"]') ||
          getTextContent('._1y74zjx') ||
          getTextContent('[data-section-id="PRICE_DEFAULT"] span') ||
          getTextContent('.price') ||
          'Price range not available';

        const images =
          getImageUrls('div[data-section-id="HERO_DEFAULT"] img') ||
          getImageUrls('img[data-testid="image"]') ||
          getImageUrls('img._1n81at5') ||
          getImageUrls('[data-section-id="MEDIA_DEFAULT"] img') ||
          getImageUrls('.gallery img') ||
          [];

        return {
          name,
          description,
          address,
          priceRange,
          images,
        };
      });

      return {
        name: data.name,
        description: data.description,
        address: data.address,
        contactInfo: 'Contact information not available',
        priceRange: data.priceRange,
        imagesUrl: data.images.length > 0 ? data.images.join(',') : url,
        sourceUrl: url,
      };
    } catch (error) {
      console.error('❌ Airbnb Puppeteer error:', error);
      return this.createFallbackResponse(
        url,
        `Airbnb Puppeteer failed: ${error}`,
      );
    } finally {
      if (page) await page.close();
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
    }
  }

  private async scrapeBookingWithPuppeteer(
    url: string,
  ): Promise<ParsedAccommodationData> {
    let page: Page | null = null;

    try {
      this.browser = await launchPuppeteerBrowser();

      page = await this.browser.newPage();

      // Set realistic user agent
      await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      );

      // Add language parameter to force French
      const urlWithLang = url.includes('?')
        ? `${url}&lang=fr`
        : `${url}?lang=fr`;

      // Navigate to the page
      await page.goto(urlWithLang, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      // Wait for content to load
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Extract data using page.evaluate
      const data = await page.evaluate(() => {
        const getTextContent = (selector: string): string | null => {
          const element = document.querySelector(selector);
          return element ? element.textContent?.trim() || null : null;
        };

        const getImageUrls = (selector: string): string[] => {
          const elements = document.querySelectorAll(selector);
          const urls: string[] = [];
          elements.forEach((el) => {
            const src = el.getAttribute('src') || el.getAttribute('data-src');
            if (src && src.startsWith('http')) {
              urls.push(src);
            }
          });
          return urls.slice(0, 5); // Limit to 5 images
        };

        // Try multiple selectors for each field
        const name =
          getTextContent('h2#hp_hotel_name') ||
          getTextContent('.hp__hotel_name') ||
          getTextContent('h1[data-testid="hotel-name"]') ||
          getTextContent('.pp-header__title') ||
          getTextContent('h1') ||
          'Booking.com Property';

        const description =
          getTextContent('#property_description_content') ||
          getTextContent('.property_description') ||
          getTextContent('[data-testid="property-description"]') ||
          getTextContent('.hp__hotel_description') ||
          getTextContent('.description') ||
          'Property found on Booking.com. Please fill in the details manually.';

        const address =
          getTextContent(
            'div[data-testid="PropertyHeaderAddressDesktop-wrapper"] > button div:nth-child(1)',
          ) ||
          getTextContent(
            'div[data-testid="PropertyHeaderAddressDesktop-wrapper"] button didiv:nth-child(1)',
          ) ||
          getTextContent(
            '[data-testid="PropertyHeaderAddressDesktop-wrapper"] button div:nth-child(1)',
          ) ||
          getTextContent('.hp_address_subtitle') ||
          getTextContent('[data-testid="address"]') ||
          getTextContent('.address') ||
          getTextContent('.location') ||
          'Address not available - please fill in manually';

        const priceRange =
          getTextContent(
            "div[data-et-mouseenter='goal:desktop_room_list_price_column_hover_over_price'] span",
          ) ||
          getTextContent('.prco-valign-middle-helper') ||
          getTextContent('.bui-price-display__value') ||
          getTextContent('[data-testid="price"]') ||
          getTextContent('.price') ||
          getTextContent('.hp__hotel_price') ||
          getTextContent('.hotel-price') ||
          getTextContent('.property-price') ||
          getTextContent('.rate') ||
          'Price range not available';

        const images =
          getImageUrls('div#photo_wrapper img') ||
          getImageUrls('picture img') ||
          getImageUrls('[data-testid="GalleryUnifiedDesktop-wrapper"]') ||
          getImageUrls('.hp_gallery img') ||
          getImageUrls('.gallery img') ||
          getImageUrls('.photos img') ||
          getImageUrls('.hotel-gallery img') ||
          getImageUrls('.property-gallery img') ||
          getImageUrls('img[data-testid="image"]') ||
          [];
        return {
          name,
          description,
          address,
          priceRange,
          images,
        };
      });

      return {
        name: data.name,
        description: data.description,
        address: data.address,
        contactInfo: 'Contact information not available',
        priceRange: data.priceRange,
        imagesUrl: data.images.length > 0 ? data.images.join(',') : url,
        sourceUrl: url,
      };
    } catch (error) {
      console.error('❌ Booking.com Puppeteer error:', error);
      return this.createFallbackResponse(
        url,
        `Booking.com Puppeteer failed: ${error}`,
      );
    } finally {
      if (page) await page.close();
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
    }
  }

  private parseAirbnbUrl(url: string): ParsedAccommodationData {
    return {
      name: 'Airbnb Property',
      description:
        'Property found on Airbnb. Please fill in the details manually.',
      address: 'Address not available - please fill in manually',
      contactInfo: 'Contact information not available',
      priceRange: 'Price range not available',
      imagesUrl: url,
      sourceUrl: url,
    };
  }

  private parseBookingUrl(url: string): ParsedAccommodationData {
    try {
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
        imagesUrl: url,
        sourceUrl: url,
      };
    } catch (error) {
      return this.createFallbackResponse(url, 'Invalid Booking.com URL');
    }
  }

  private createFallbackResponse(
    url: string,
    error: string,
  ): ParsedAccommodationData {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.toLowerCase();

      let platformName = 'External Site';
      if (domain.includes('airbnb.com')) platformName = 'Airbnb';
      else if (domain.includes('booking.com')) platformName = 'Booking.com';
      else if (domain.includes('hostelworld.com')) platformName = 'Hostelworld';
      else if (domain.includes('hotels.com')) platformName = 'Hotels.com';
      else if (domain.includes('expedia.com')) platformName = 'Expedia';
      else if (domain.includes('tripadvisor.com')) platformName = 'TripAdvisor';

      return {
        name: `${platformName} Property`,
        description: `Property found on ${platformName}. Please fill in the details manually. Error: ${error}`,
        address: 'Address not available - please fill in manually',
        contactInfo: 'Contact information not available',
        priceRange: 'Price range not available',
        imagesUrl: url,
        sourceUrl: url,
        error,
      };
    } catch (error) {
      return {
        name: 'Unknown Property',
        description:
          'Failed to extract data. Please fill in the details manually.',
        address: 'Address not available - please fill in manually',
        contactInfo: 'Contact information not available',
        priceRange: 'Price range not available',
        imagesUrl: url,
        sourceUrl: url,
        error: `URL parsing failed: ${error}`,
      };
    }
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

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

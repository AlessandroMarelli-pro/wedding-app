#!/usr/bin/env python3
"""
Enhanced Accommodation Scraper Service
Extracts detailed information from Airbnb and Booking.com using specialized scrapers
"""

import json
import sys
import urllib.parse
from typing import Dict

# Import the enhanced scrapers
from airbnb_scraper import AirbnbScraper
from booking_scraper import BookingScraper
from bs4 import BeautifulSoup


class AccommodationScraper:
    def __init__(self):
        # Initialize the enhanced scrapers
        self.airbnb_scraper = AirbnbScraper()
        self.booking_scraper = BookingScraper(headless=True)

    def scrape_accommodation(self, url: str) -> Dict[str, str]:
        """Main method to scrape accommodation data from URL"""
        try:
            # Parse URL to determine platform
            parsed_url = urllib.parse.urlparse(url)
            domain = parsed_url.hostname.lower()

            if "airbnb.com" in domain or "airbnb.fr" in domain:
                return self.airbnb_scraper.scrape_accommodation(url)
            elif "booking.com" in domain:
                return self.booking_scraper.scrape_accommodation(url)
            else:
                return {
                    "error": f"Unsupported platform: {domain}",
                    "name": "Unsupported Property",
                    "description": f"Only Booking.com and Airbnb are supported. Found: {domain}",
                    "address": "Address not available",
                    "contactInfo": "Contact information not available",
                    "priceRange": "Price range not available",
                    "imagesUrl": "",
                    "sourceUrl": url,
                }

        except Exception as e:
            return {
                "error": f"Failed to scrape {url}: {str(e)}",
                "name": "Unknown Property",
                "description": "Failed to extract data",
                "address": "Address not available",
                "contactInfo": "Contact information not available",
                "priceRange": "Price range not available",
                "imagesUrl": "",
                "sourceUrl": url,
            }

    def _scrape_airbnb(self, url: str) -> Dict[str, str]:
        """Scrape Airbnb listing"""
        try:
            response = self.session.get(url, timeout=10)
            soup = BeautifulSoup(response.content, "html.parser")

            # Extract name
            name = self._extract_text(
                soup,
                [
                    'h1[data-testid="listing-title"]',
                    "h1._14i3z6h",
                    'h1[data-section-id="TITLE_DEFAULT"] h1',
                    "h1",
                ],
            )

            # Extract description
            description = self._extract_text(
                soup,
                [
                    '[data-testid="listing-description"]',
                    "._1n81at5",
                    '[data-section-id="DESCRIPTION_DEFAULT"] div',
                    ".description",
                ],
            )

            # Extract address
            address = self._extract_text(
                soup,
                [
                    '[data-testid="listing-location"]',
                    "._1n81at5",
                    '[data-section-id="LOCATION_DEFAULT"] div',
                    ".location",
                ],
            )

            # Extract price range
            price_range = self._extract_text(
                soup,
                [
                    '[data-testid="price"]',
                    "._1y74zjx",
                    '[data-section-id="PRICE_DEFAULT"] span',
                    ".price",
                ],
            )

            # Extract images
            images = self._extract_images(
                soup,
                [
                    'img[data-testid="image"]',
                    "img._1n81at5",
                    '[data-section-id="MEDIA_DEFAULT"] img',
                    ".gallery img",
                ],
            )

            return {
                "name": name or "Airbnb Property",
                "description": description
                or "Property found on Airbnb. Please fill in the details manually.",
                "address": address or "Address not available - please fill in manually",
                "contactInfo": "Contact information not available",
                "priceRange": price_range or "Price range not available",
                "imagesUrl": ",".join(images[:5]) if images else url,
                "sourceUrl": url,
            }

        except Exception as e:
            return self._create_fallback_response(url, "Airbnb", str(e))

    def _scrape_booking(self, url: str) -> Dict[str, str]:
        """Scrape Booking.com listing"""
        try:
            response = self.session.get(url, timeout=10)
            soup = BeautifulSoup(response.content, "html.parser")

            # Extract name
            name = self._extract_text(
                soup,
                [
                    "h2#hp_hotel_name",
                    ".hp__hotel_name",
                    'h1[data-testid="hotel-name"]',
                    "h1",
                ],
            )

            # Extract description
            description = self._extract_text(
                soup,
                [
                    "#property_description_content",
                    ".property_description",
                    '[data-testid="property-description"]',
                    ".description",
                ],
            )

            # Extract address
            address = self._extract_text(
                soup,
                [
                    ".hp_address_subtitle",
                    '[data-testid="address"]',
                    ".address",
                    ".location",
                ],
            )

            # Extract price range
            price_range = self._extract_text(
                soup,
                [
                    ".prco-valign-middle-helper",
                    ".bui-price-display__value",
                    '[data-testid="price"]',
                    ".price",
                ],
            )

            # Extract images
            images = self._extract_images(
                soup,
                [
                    ".hp_gallery img",
                    '[data-testid="gallery-image"]',
                    ".gallery img",
                    ".photos img",
                ],
            )

            return {
                "name": name or "Booking.com Property",
                "description": description
                or "Property found on Booking.com. Please fill in the details manually.",
                "address": address or "Address not available - please fill in manually",
                "contactInfo": "Contact information not available",
                "priceRange": price_range or "Price range not available",
                "imagesUrl": ",".join(images[:5]) if images else url,
                "sourceUrl": url,
            }

        except Exception as e:
            return self._create_fallback_response(url, "Booking.com", str(e))

    def _create_fallback_response(
        self, url: str, platform: str, error: str
    ) -> Dict[str, str]:
        """Create fallback response when scraping fails"""
        return {
            "name": f"{platform} Property",
            "description": f"Property found on {platform}. Please fill in the details manually. Error: {error}",
            "address": "Address not available - please fill in manually",
            "contactInfo": "Contact information not available",
            "priceRange": "Price range not available",
            "imagesUrl": url,
            "sourceUrl": url,
        }


def main():
    """Main function for command line usage"""
    if len(sys.argv) != 2:
        print("Usage: python accommodation_scraper.py <url>")
        sys.exit(1)

    url = sys.argv[1]
    scraper = AccommodationScraper()
    result = scraper.scrape_accommodation(url)

    # Output as JSON
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()

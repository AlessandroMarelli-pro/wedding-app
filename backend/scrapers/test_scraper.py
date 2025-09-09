#!/usr/bin/env python3
"""
Test script for the accommodation scraper
"""

import json
import os
import sys

# Add the current directory to the path so we can import the scraper
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from accommodation_scraper import AccommodationScraper


def test_scraper():
    """Test the scraper with various URLs"""
    scraper = AccommodationScraper()

    # Test URLs (these are examples and may not work)
    test_urls = [
        #  "https://www.airbnb.fr/rooms/1195765802012741129?check_in=2025-10-31&check_out=2025-11-02&photo_id=1947478521&source_impression_id=p3_1757423629_P3O7OWCyP9Eu1qnu&previous_page_section_name=1000",
        "https://www.booking.com/Share-mYl9jQ",
    ]

    print("Testing accommodation scraper with various URLs...")
    print("=" * 60)

    for url in test_urls:
        print(f"\nTesting: {url}")
        print("-" * 40)

        try:
            result = scraper.scrape_accommodation(url)
            print(json.dumps(result, indent=2))
        except Exception as e:
            print(f"Error: {e}")

    print("\n" + "=" * 60)
    print("Test completed!")


if __name__ == "__main__":
    test_scraper()
